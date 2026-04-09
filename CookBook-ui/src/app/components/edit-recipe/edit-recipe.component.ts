import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RecipeService } from '../../services/recipe.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { CategorieService } from '../../services/categorie.service';
import { IngridientsService } from '../../services/ingredients.service';
import { CookingStepsService } from '../../services/cookingSteps.service';
import { NutritionInfoService } from '../../services/nutritionInfo.service';
import { Category } from '../../models/category';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-edit-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.scss']
})
export class EditRecipeComponent implements OnInit {
  recipeId = '';
  isLoading = true;
  submitted = false;
  isSaving = false;

  // Image
  imageUrl = '';
  imagePreview: string | null = null;
  isUploadingImage = false;
  selectedImageFile: File | null = null;

  // Form fields
  title = '';
  description = '';
  category = '';
  difficulty = 'EINFACH';
  prepTime = 0;
  cookTime = 0;
  servings = 4;
  tags: string[] = [];
  currentTag = '';

  ingredients: { name: string; amount: number; unit: string }[] = [
    { name: '', amount: 0, unit: '' }
  ];

  steps: { instruction: string; duration?: number }[] = [
    { instruction: '', duration: undefined }
  ];

  nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  categories: Category[] = [];

  private originalSnapshot: string = '';

  get isFormValid(): boolean {
    return !!(this.title.trim() && this.description.trim() && this.category);
  }

  get hasChanges(): boolean {
    if (this.selectedImageFile || !this.imagePreview) return true;
    const current = JSON.stringify({
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      prepTime: this.prepTime,
      cookTime: this.cookTime,
      servings: this.servings,
      tags: [...this.tags].sort(),
      ingredients: this.ingredients,
      steps: this.steps,
      nutrition: this.nutrition
    });
    return current !== this.originalSnapshot;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private recipeService: RecipeService,
    private userService: UserService,
    private toastService: ToastService,
    private cloudinaryService: CloudinaryService,
    private categorieService: CategorieService,
    private ingredientsService: IngridientsService,
    private cookingStepsService: CookingStepsService,
    private nutritionInfoService: NutritionInfoService
  ) {}

  ngOnInit(): void {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.recipeId = this.route.snapshot.paramMap.get('id') ?? '';

    forkJoin({
      recipe: this.recipeService.getRecipeById(this.recipeId),
      ingredients: this.ingredientsService.getIngredientsWithRecipeId(this.recipeId),
      steps: this.cookingStepsService.getCookingStepsWithRecipeId(this.recipeId),
      nutrition: this.nutritionInfoService.getNutritionInfoWithRecipeId(this.recipeId),
      categories: this.categorieService.getAllCategories()
    }).subscribe({
      next: ({ recipe, ingredients, steps, nutrition, categories }) => {
        // Check ownership
        const currentUser = this.userService.getCurrentUserSnapshot();
        if (recipe.author?.id !== currentUser?.id) {
          this.toastService.showError('Du kannst nur deine eigenen Rezepte bearbeiten.');
          this.router.navigate(['/my-recipes']);
          return;
        }

        this.categories = categories;

        // Pre-fill form
        this.title = recipe.title;
        this.description = recipe.description;
        this.category = recipe.category?.name ?? '';
        this.difficulty = recipe.difficulty;
        this.prepTime = recipe.prepTime;
        this.cookTime = recipe.cookTime;
        this.servings = recipe.servings;
        this.tags = recipe.tags ?? [];
        this.imageUrl = recipe.image ?? '';
        if (recipe.image && recipe.image.startsWith('http')) {
          this.imagePreview = recipe.image;
        }

        this.ingredients = ingredients.length > 0
          ? ingredients.map(i => ({ name: i.name, amount: i.amount, unit: i.unit }))
          : [{ name: '', amount: 0, unit: '' }];

        this.steps = steps.length > 0
          ? steps.map(s => ({ instruction: s.instruction, duration: s.duration }))
          : [{ instruction: '', duration: undefined }];

        if (nutrition) {
          this.nutrition = {
            calories: nutrition.calories ?? 0,
            protein: nutrition.protein ?? 0,
            carbs: nutrition.carbs ?? 0,
            fat: nutrition.fat ?? 0
          };
        }

        this.originalSnapshot = JSON.stringify({
          title: this.title,
          description: this.description,
          category: this.category,
          difficulty: this.difficulty,
          prepTime: this.prepTime,
          cookTime: this.cookTime,
          servings: this.servings,
          tags: [...this.tags].sort(),
          ingredients: this.ingredients,
          steps: this.steps,
          nutrition: this.nutrition
        });
        this.isLoading = false;
      },
      error: () => {
        this.toastService.showError('Rezept konnte nicht geladen werden.');
        this.router.navigate(['/my-recipes']);
      }
    });
  }

  addIngredient(): void { this.ingredients.push({ name: '', amount: 0, unit: '' }); }
  removeIngredient(i: number): void { if (this.ingredients.length > 1) this.ingredients.splice(i, 1); }
  addStep(): void { this.steps.push({ instruction: '', duration: undefined }); }
  removeStep(i: number): void { if (this.steps.length > 1) this.steps.splice(i, 1); }

  addTag(): void {
    if (this.currentTag.trim() && !this.tags.includes(this.currentTag.trim())) {
      this.tags.push(this.currentTag.trim());
      this.currentTag = '';
    }
  }
  removeTag(tag: string): void { this.tags = this.tags.filter(t => t !== tag); }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const validation = this.cloudinaryService.validateImage(file);
    if (!validation.valid) {
      this.toastService.showError(validation.error!);
      input.value = '';
      return;
    }
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageUrl = '';
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.isUploadingImage = false;
  }

  goBack(): void { this.location.back(); }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.isUploadingImage = !!this.selectedImageFile;

    const upload$ = this.selectedImageFile
      ? this.cloudinaryService.uploadImage(this.selectedImageFile)
      : of(this.imageUrl);

    upload$.pipe(
      switchMap((imageUrl) => {
        this.isUploadingImage = false;
        const recipeData = {
          title: this.title,
          description: this.description,
          image: imageUrl || undefined,
          categoryName: this.category,
          difficulty: this.difficulty,
          prepTime: this.prepTime,
          cookTime: this.cookTime,
          servings: this.servings,
          tags: this.tags,
          ingredients: this.ingredients.filter(i => i.name && i.amount && i.unit),
          steps: this.steps.filter(s => s.instruction).map(s => ({
            instruction: s.instruction,
            duration: s.duration || null
          })),
          nutrition: {
            calories: this.nutrition.calories || 0,
            protein: this.nutrition.protein || 0,
            carbs: this.nutrition.carbs || 0,
            fat: this.nutrition.fat || 0
          }
        };
        return this.recipeService.updateRecipe(this.recipeId, recipeData);
      })
    ).subscribe({
      next: (updated) => {
        this.isSaving = false;
        this.toastService.showSuccess('Rezept erfolgreich aktualisiert!');
        setTimeout(() => this.router.navigate(['/recipe', updated.id]), 800);
      },
      error: () => {
        this.isSaving = false;
        this.isUploadingImage = false;
        this.toastService.showError('Rezept konnte nicht gespeichert werden.');
      }
    });
  }
}
