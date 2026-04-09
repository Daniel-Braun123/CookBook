import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { UserService } from '../../services/user.service';
import { RecipeService } from '../../services/recipe.service';
import { ToastService } from '../../services/toast.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { switchMap, of } from 'rxjs';
import { CategorieService } from '../../services/categorie.service';
import { Category } from '../../models/category';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, HeaderComponent, FooterComponent],
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.scss']
})
export class CreateRecipeComponent implements OnInit {
  // Image upload
  imageUrl = '';
  imagePreview: string | null = null;
  isUploadingImage = false;
  selectedImageFile: File | null = null;

  submitted = false;

  get isFormValid(): boolean {
    return !!(this.title.trim() && this.description.trim() && this.category);
  }

  // Form data
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
  
  nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  categories: Category[] = [];

  constructor(
    private userService: UserService,
    private recipeService: RecipeService,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private cloudinaryService: CloudinaryService,
    private categoryService: CategorieService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    this.categoryService.getAllCategories().subscribe(cats => this.categories = cats);

  }

  addIngredient(): void {
    this.ingredients.push({ name: '', amount: 0, unit: '' });
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.splice(index, 1);
    }
  }

  addStep(): void {
    this.steps.push({ instruction: '', duration: undefined });
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.splice(index, 1);
    }
  }

  addTag(): void {
    if (this.currentTag.trim() && !this.tags.includes(this.currentTag.trim())) {
      this.tags.push(this.currentTag.trim());
      this.currentTag = '';
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

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

    // Store file for upload on submit
    this.selectedImageFile = file;

    // Show preview immediately without uploading
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageUrl = '';
    this.imagePreview = null;
    this.isUploadingImage = false;
    this.selectedImageFile = null;
  }

  onSubmit(): void {
    this.submitted = true;

    // Check if user is logged in before submitting
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Validate required fields
    if (!this.isFormValid) {
      return;
    }

    // Upload image first if one was selected, then create recipe
    this.isUploadingImage = !!this.selectedImageFile;

    const upload$ = this.selectedImageFile
      ? this.cloudinaryService.uploadImage(this.selectedImageFile)
      : of('');

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
          steps: this.steps.filter(s => s.instruction).map((step) => ({
            instruction: step.instruction,
            duration: step.duration || null
          })),
          nutrition: {
            calories: this.nutrition.calories || 0,
            protein: this.nutrition.protein || 0,
            carbs: this.nutrition.carbs || 0,
            fat: this.nutrition.fat || 0
          }
        };
        return this.recipeService.createRecipe(recipeData);
      })
    ).subscribe({
      next: (createdRecipe) => {
        this.toastService.showSuccess('Rezept erfolgreich erstellt! 🎉');
        setTimeout(() => {
          this.router.navigate(['/recipe', createdRecipe.id]);
        }, 1000);
      },
      error: (error) => {
        this.isUploadingImage = false;
        console.error('Error creating recipe:', error);
        this.toastService.showError('Fehler beim Erstellen des Rezepts. Bitte versuche es erneut.');
      }
    });
  }

   goBack(): void { 
    this.location.back(); 
  }
}
