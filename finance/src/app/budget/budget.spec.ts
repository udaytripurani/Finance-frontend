import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BudgetsComponent } from './budget';

describe('BudgetsComponent', () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BudgetsComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    
    // Mock localStorage to prevent authentication errors
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.budgetForm.get('name')?.value).toBe('');
    expect(component.budgetForm.get('amount')?.value).toBe('');
    expect(component.budgetForm.get('category')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const nameControl = component.budgetForm.get('name');
    const amountControl = component.budgetForm.get('amount');
    const categoryControl = component.budgetForm.get('category');
    
    nameControl?.setValue('');
    amountControl?.setValue('');
    categoryControl?.setValue('');
    
    expect(nameControl?.hasError('required')).toBe(true);
    expect(amountControl?.hasError('required')).toBe(true);
    expect(categoryControl?.hasError('required')).toBe(true);
  });

  it('should validate amount is positive', () => {
    const amountControl = component.budgetForm.get('amount');
    
    amountControl?.setValue(-100);
    expect(amountControl?.hasError('min')).toBe(true);
    
    amountControl?.setValue(100);
    expect(amountControl?.valid).toBe(true);
  });

  it('should have expense categories array', () => {
    expect(Array.isArray(component.expenseCategories)).toBe(true);
  });

  it('should have budgets array', () => {
    expect(Array.isArray(component.budgets)).toBe(true);
  });

  it('should have budget alerts array', () => {
    expect(Array.isArray(component.budgetAlerts)).toBe(true);
  });

  it('should have months array', () => {
    expect(Array.isArray(component.months)).toBe(true);
    expect(component.months.length).toBe(12);
  });

  it('should initialize showCreateForm as false', () => {
    expect(component.showCreateForm).toBe(false);
  });

  it('should initialize showCategoryForm as false', () => {
    expect(component.showCategoryForm).toBe(false);
  });

  it('should initialize editingBudget as null', () => {
    expect(component.editingBudget).toBe(null);
  });

  it('should initialize editingCategory as null', () => {
    expect(component.editingCategory).toBe(null);
  });
});
