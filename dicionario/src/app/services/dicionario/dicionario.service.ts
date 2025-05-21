import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WordEntry {
  word: string;
  word_id: number;
  sense: number;
  xml: string;
  normalized: string;
  creator: string;
  timestamp: string;
  revision_id: number;
  last_revision: number;
  deleted: number;
  deletor: string | null;
  moderator: string | null;
  derived_from: string | null;
}

export interface NewsItem {
  title: string;
  user: string;
  date: string;
  idnew: number;
  text: string;
}

export interface WordOfTheDay {
  word_id: string;
  xml: string;
}

export interface RandomWord {
  sense: number;
  word: string;
  wid: number;
}

export interface PrefixResult {
  word: string;
  sense: number;
  preview: string;
}

export interface Metadata {
  count?: string;
  first_word?: string;
  last_word?: string;
  word?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DicionarioService {
  private readonly baseUrl = 'https://api.dicionario-aberto.net';

  constructor(private http: HttpClient) { }

  /**
   * Obter novidades, opcionalmente com limite ao número de itens
   * @param limit Número limite de itens (opcional)
   */
  getNews(limit?: number): Observable<NewsItem[]> {
    const url = limit ? `${this.baseUrl}/news?limit=${limit}` : `${this.baseUrl}/news`;
    return this.http.get<NewsItem[]>(url);
  }

  /**
   * Permite obter alguns metadados
   * @param key Chave válida: 'count', 'first_word', 'last_word', 'word'
   */
  getMetadata(key: 'count' | 'first_word' | 'last_word' | 'word'): Observable<Metadata> {
    return this.http.get<Metadata>(`${this.baseUrl}/metadata/${key}`);
  }

  /**
   * Retorna a entrada em destaque (calculada cada 2 horas)
   */
  getWordOfTheDay(): Observable<WordOfTheDay> {
    return this.http.get<WordOfTheDay>(`${this.baseUrl}/wotd`);
  }

  /**
   * Retorna uma entrada aleatória
   */
  getRandomWord(): Observable<RandomWord> {
    return this.http.get<RandomWord>(`${this.baseUrl}/random`);
  }

  /**
   * Retorna a entrada correspondente ao verbete procurado
   * @param word Palavra a ser pesquisada
   * @param sense Número da aceção (opcional)
   */
  getWord(word: string, sense?: number): Observable<WordEntry[]> {
    const url = sense ? `${this.baseUrl}/word/${word}/${sense}` : `${this.baseUrl}/word/${word}`;
    return this.http.get<WordEntry[]>(url);
  }

  /**
   * Retorna uma lista das palavras que começam com a string indicada
   * @param prefix Prefixo a ser pesquisado
   */
  getWordsByPrefix(prefix: string): Observable<PrefixResult[]> {
    return this.http.get<PrefixResult[]>(`${this.baseUrl}/prefix/${prefix}`);
  }

  /**
   * Retorna uma lista das palavras que incluem a string indicada
   * @param infix String que deve estar contida na palavra
   */
  getWordsByInfix(infix: string): Observable<PrefixResult[]> {
    return this.http.get<PrefixResult[]>(`${this.baseUrl}/infix/${infix}`);
  }

  /**
   * Retorna uma lista das palavras que terminam na string indicada
   * @param suffix Sufixo a ser pesquisado
   */
  getWordsBySuffix(suffix: string): Observable<PrefixResult[]> {
    return this.http.get<PrefixResult[]>(`${this.baseUrl}/suffix/${suffix}`);
  }

  /**
   * Retorna uma lista de palavras próximas, com distância de Levenshtein 1
   * @param word Palavra de referência
   */
  getNearWords(word: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/near/${word}`);
  }

  /**
   * Busca reversa (funcionalidade não completamente documentada na API)
   * @param query Query de busca reversa
   */
  reverseSearch(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reverse/${query}`);
  }
}