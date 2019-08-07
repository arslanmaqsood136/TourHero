import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import {catchError,map,tap} from 'rxjs/operators'; // catchError is for error handling
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class HeroService {
  private heroesUrl = 'api/heroes';  // URL to web api
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private messageService: MessageService,private http : HttpClient) { }
  // Http returns single response of rxjs type
  getHeroes(): Observable<Hero[]> {
    //return of(HEROES);
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap(_ => this.log("Heroes fetched")),
      catchError(this.handleError<Hero[]>('getHeroes',[]))
    ) // this will return body of response with <Hero[]> type JSON otherwise it returns untyped JSON
  }
  
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    console.log(url);
    // TODO: send the message _after_ fetching the hero
    //this.messageService.add(`HeroService: fetched hero id=${id}`);
    //return of(HEROES.find(hero => hero.id === id));
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id = ${id}`))
    )
  }
  updateHero(hero:Hero): Observable<any>{
    return this.http.put(this.heroesUrl,hero,this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    )
  }
  addHero(hero:Hero):Observable<Hero>{
    return this.http.post<Hero>(this.heroesUrl,hero,this.httpOptions).pipe(
      tap((newHero : Hero)=> this.log(`added Hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    )
  }
  deleteHero(hero:Hero| number):Observable<Hero>{
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;
    return this.http.delete<Hero>(url,this.httpOptions).pipe(
      tap(_ => this.log(`deleted Hero id = ${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))

    )
  }
  searchHeroes(term:string):Observable<Hero[]>{
    term = term.trim();
    if(!term){
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes',[]))
    )

  }


  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message:string){
    this.messageService.add(`Hero Service ${message}`);
  }
}
