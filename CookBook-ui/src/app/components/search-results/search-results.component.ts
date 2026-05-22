import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { RecipeService } from '../../services/recipe.service';
import { RecipeEventService } from '../../services/recipe-event.service';
import { Recipe } from '../../models/recipe';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RecipeCardComponent, ScrollRevealDirective],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  query = '';
  recipes: Recipe[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private recipeEventService: RecipeEventService
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          this.query = params['q'] || '';
          this.isLoading = true;
          return this.recipeService.searchRecipes(this.query);
        })
      )
      .subscribe(recipes => {
        this.recipes = recipes;
        this.isLoading = false;
      });

    // Live sync
    this.recipeEventService.recipeDeleted$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      this.recipes = this.recipes.filter(r => r.id !== String(id));
    });

    this.recipeEventService.recipeCreated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.query) {
        this.recipeService.searchRecipes(this.query).pipe(takeUntil(this.destroy$)).subscribe(r => this.recipes = r);
      }
    });

    this.recipeEventService.recipeUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.query) {
        this.recipeService.searchRecipes(this.query).pipe(takeUntil(this.destroy$)).subscribe(r => this.recipes = r);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
