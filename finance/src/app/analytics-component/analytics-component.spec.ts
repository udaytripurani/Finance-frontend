import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnalyticsComponent } from './analytics-component';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnalyticsComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    
    // Mock localStorage to prevent authentication errors
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have filterForm', () => {
    expect(component.filterForm).toBeDefined();
  });

  it('should initialize monthlySummary as null', () => {
    expect(component.monthlySummary).toBe(null);
  });

  it('should have categoryBreakdown array', () => {
    expect(Array.isArray(component.categoryBreakdown)).toBe(true);
  });

  it('should have historicalData array', () => {
    expect(Array.isArray(component.historicalData)).toBe(true);
  });

  it('should initialize comparisonData as null', () => {
    expect(component.comparisonData).toBe(null);
  });

  it('should have recurringTransactions array', () => {
    expect(Array.isArray(component.recurringTransactions)).toBe(true);
  });

  it('should have budgetWarnings array', () => {
    expect(Array.isArray(component.budgetWarnings)).toBe(true);
  });

  it('should initialize currentBalance as 0', () => {
    expect(component.currentBalance).toBe(0);
  });

  it('should initialize isLoading as false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should initialize selectedMonth with current month', () => {
    const currentMonth = new Date().getMonth() + 1;
    expect(component.selectedMonth).toBe(currentMonth);
  });

  it('should initialize selectedYear with current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.selectedYear).toBe(currentYear);
  });

  it('should have monthNames array', () => {
    expect(Array.isArray(component.monthNames)).toBe(true);
    expect(component.monthNames.length).toBe(12);
  });

  it('should have years array', () => {
    expect(Array.isArray(component.years)).toBe(true);
    expect(component.years.length).toBeGreaterThan(0);
  });

  it('should have getAbsoluteValue method', () => {
    expect(typeof component.getAbsoluteValue).toBe('function');
  });

  it('should have getDaysInMonth method', () => {
    expect(typeof component.getDaysInMonth).toBe('function');
  });

  it('should have getComparisonIcon method', () => {
    expect(typeof component.getComparisonIcon).toBe('function');
  });

  it('should have getComparisonClass method', () => {
    expect(typeof component.getComparisonClass).toBe('function');
  });

  it('should have getBudgetUtilization method', () => {
    expect(typeof component.getBudgetUtilization).toBe('function');
  });

  it('should have getTopExpenseCategory method', () => {
    expect(typeof component.getTopExpenseCategory).toBe('function');
  });

  it('should have getAverageDailyExpense method', () => {
    expect(typeof component.getAverageDailyExpense).toBe('function');
  });

  it('should have exportDetailedReport method', () => {
    expect(typeof component.exportDetailedReport).toBe('function');
  });

  it('should have exportToCsv method', () => {
    expect(typeof component.exportToCsv).toBe('function');
  });

  it('should have getBudgetAlertClass method', () => {
    expect(typeof component.getBudgetAlertClass).toBe('function');
  });

  it('should have getProgressBarClass method', () => {
    expect(typeof component.getProgressBarClass).toBe('function');
  });

  it('should have calculateProgressPercentage method', () => {
    expect(typeof component.calculateProgressPercentage).toBe('function');
  });

  it('should have getCategoryColor method', () => {
    expect(typeof component.getCategoryColor).toBe('function');
  });
});
