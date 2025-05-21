import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { DicionarioService, PrefixResult, WordEntry } from '../../services/dicionario/dicionario.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [NgIf, CommonModule, ReactiveFormsModule],
  templateUrl: './dicionario-list.component.html',
  styleUrls: ['./dicionario-list.component.css']
})
export class DicionarioListComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');

  // Estados da aplicação
  words: PrefixResult[] = [];
  currentWord: string = '';
  currentWordDetails: WordEntry[] = [];
  allResults: PrefixResult[] = []; // Armazena todos os resultados da busca atual

  // Estados visuais
  loading$ = new BehaviorSubject<boolean>(false);
  loadingMore$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  showResults$ = new BehaviorSubject<boolean>(false);

  // Controle de paginação e scroll infinito
  currentPage = 0;
  pageSize = 15;
  hasMoreData = true;

  // Para gerenciar subscriptions
  private destroy$ = new Subject<void>();

  // Controle de scroll
  private scrollThreshold = 200;

  constructor(private dicionarioService: DicionarioService) { }

  ngOnInit(): void {
    this.setupSearch();
    this.loadWordOfTheDay(); // Carrega palavra do dia inicialmente
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((searchTerm) => {
        if (searchTerm && searchTerm.trim().length >= 2) {
          this.loading$.next(true);
          this.error$.next(null);
          this.showResults$.next(false);
          this.resetPagination();
        } else if (!searchTerm || searchTerm.trim().length === 0) {
          this.showResults$.next(false);
          this.loading$.next(false);
          this.loadWordOfTheDay();
        }
      }),
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.trim().length < 2) {
          return of([]);
        }
        return this.searchWords(searchTerm.trim()).pipe(
          catchError(error => {
            console.error('Erro na busca:', error);
            this.error$.next('Erro ao buscar palavras. Tente novamente.');
            return of([]);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.loading$.next(false);
        if (results.length > 0) {
          this.allResults = results;
          this.words = results.slice(0, this.pageSize);
          this.currentPage = 1;
          this.hasMoreData = results.length > this.pageSize;
          this.showResults$.next(true);

          // Carrega detalhes da primeira palavra automaticamente
          if (this.words.length > 0) {
            this.loadWordDetail(this.words[0]);
          }
        } else if (this.searchControl.value && this.searchControl.value.trim().length >= 2) {
          this.error$.next('Nenhuma palavra encontrada.');
          this.showResults$.next(false);
        }
      }
    });
  }

  private searchWords(searchTerm: string): Observable<PrefixResult[]> {
    // Busca por prefixo primeiro, depois por infix se necessário
    return this.dicionarioService.getWordsByPrefix(searchTerm).pipe(
      switchMap(prefixResults => {
        if (prefixResults.length > 0) {
          return of(prefixResults);
        }
        // Se não encontrou por prefixo, tenta por infix
        return this.dicionarioService.getWordsByInfix(searchTerm);
      })
    );
  }

  private loadWordOfTheDay(): void {
    this.dicionarioService.getWordOfTheDay().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (wordOfDay) => {
        // Extrai a palavra do XML
        const word = this.extractWordFromXML(wordOfDay.xml);
        if (word) {
          this.currentWord = word;
          this.loadWordDetailsById(wordOfDay.word_id);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar palavra do dia:', error);
        // Carrega uma palavra aleatória como fallback
        this.loadRandomWord();
      }
    });
  }

  private loadRandomWord(): void {
    this.dicionarioService.getRandomWord().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (randomWord) => {
        this.currentWord = randomWord.word;
        this.loadWordDetail({ word: randomWord.word, sense: randomWord.sense, preview: '' });
      },
      error: (error) => {
        console.error('Erro ao carregar palavra aleatória:', error);
      }
    });
  }

  private loadWordDetailsById(wordId: string): void {
    // Como a API não tem endpoint direto por ID, vamos usar o word endpoint
    this.dicionarioService.getWord(this.currentWord).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (details) => {
        this.currentWordDetails = details;
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes da palavra:', error);
      }
    });
  }

  loadWordDetail(wordResult: PrefixResult): void {
    this.currentWord = wordResult.word;
    this.loading$.next(true);

    this.dicionarioService.getWord(wordResult.word, wordResult.sense).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (details) => {
        this.currentWordDetails = details;
        this.loading$.next(false);
      },
      error: (error) => {
        console.error(`Erro ao carregar detalhes de ${wordResult.word}:`, error);
        this.error$.next('Erro ao carregar detalhes da palavra.');
        this.loading$.next(false);
      }
    });
  }

  private resetPagination(): void {
    this.currentPage = 0;
    this.hasMoreData = true;
    this.words = [];
    this.allResults = [];
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.shouldLoadMore()) {
      this.loadMoreWords();
    }
  }

  private shouldLoadMore(): boolean {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return (
      !this.loadingMore$.value &&
      this.hasMoreData &&
      this.showResults$.value &&
      (documentHeight - (scrollTop + windowHeight)) < this.scrollThreshold
    );
  }

  private loadMoreWords(): void {
    if (this.loadingMore$.value || !this.hasMoreData || this.allResults.length === 0) return;

    this.loadingMore$.next(true);

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const newWords = this.allResults.slice(startIndex, endIndex);

    // Simula um delay mínimo para mostrar o loading
    setTimeout(() => {
      if (newWords.length > 0) {
        this.words = [...this.words, ...newWords];
        this.currentPage++;
      }

      this.hasMoreData = endIndex < this.allResults.length;
      this.loadingMore$.next(false);
    }, 500);
  }

  // Métodos para extrair informações do XML
  extractDefinition(xmlString: string): string {
    if (!xmlString) return 'Definição não disponível';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const defElement = doc.querySelector('def');
      return defElement ? defElement.textContent?.trim() || 'Definição não disponível' : 'Definição não disponível';
    } catch (error) {
      return 'Erro ao processar definição';
    }
  }

  extractGrammaticalClass(xmlString: string): string {
    if (!xmlString) return '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const gramElement = doc.querySelector('gramGrp');
      return gramElement ? gramElement.textContent?.trim() || '' : '';
    } catch (error) {
      return '';
    }
  }

  private extractWordFromXML(xmlString: string): string {
    if (!xmlString) return '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const lemElement = doc.querySelector('lem');
      return lemElement ? lemElement.textContent?.trim() || '' : '';
    } catch (error) {
      return '';
    }
  }

  extractExamples(xmlString: string): string[] {
    if (!xmlString) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const exampleElements = doc.querySelectorAll('ex');
      return Array.from(exampleElements).map(ex => ex.textContent?.trim() || '').filter(text => text);
    } catch (error) {
      return [];
    }
  }

  // Métodos para interação com a UI
  onSearchSubmit(): void {
    const searchTerm = this.searchControl.value;
    if (searchTerm && searchTerm.trim().length >= 2) {
      this.searchControl.setValue(searchTerm.trim());
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.showResults$.next(false);
    this.error$.next(null);
    this.loadWordOfTheDay();
  }

  // Método para navegação entre palavras da lista
  selectWord(wordResult: PrefixResult): void {
    this.loadWordDetail(wordResult);
  }

  // Getters para facilitar o uso no template
  get isLoading(): boolean {
    return this.loading$.value;
  }

  get isLoadingMore(): boolean {
    return this.loadingMore$.value;
  }

  get hasError(): boolean {
    return !!this.error$.value;
  }

  get errorMessage(): string | null {
    return this.error$.value;
  }

  get showResults(): boolean {
    return this.showResults$.value;
  }

  get hasCurrentWord(): boolean {
    return !!this.currentWord && this.currentWordDetails.length > 0;
  }

  get currentDefinitions(): string[] {
    return this.currentWordDetails.map(entry => this.extractDefinition(entry.xml)).filter(def => def !== 'Definição não disponível');
  }

  get currentExamples(): string[] {
    const allExamples: string[] = [];
    this.currentWordDetails.forEach(entry => {
      const examples = this.extractExamples(entry.xml);
      allExamples.push(...examples);
    });
    return allExamples;
  }

  get currentGrammaticalClass(): string {
    if (this.currentWordDetails.length > 0) {
      return this.extractGrammaticalClass(this.currentWordDetails[0].xml);
    }
    return '';
  }
}