import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  const mockCategories = [
    { id: 1, name: 'Food', type: 'expense' },
    { id: 2, name: 'Transport', type: 'expense' },
    { id: 3, name: 'Salary', type: 'income' }
  ];

  const mockBudgets = [
    { id: 1, name: 'Food Budget', amount: 1000, category: 1, start_date: '2024-01-01', end_date: '2024-12-31' },
    { id: 2, name: 'Transport Budget', amount: 500, category: 2, start_date: '2024-01-01', end_date: '2024-12-31' }
  ];

  const mockIncomeTransactions = [
    { id: 1, amount: 5000, category: 3, description: 'Salary', date: '2024-01-15', type: 'income' }
  ];

  const mockExpenseTransactions = [
    { id: 2, amount: 200, category: 1, description: 'Groceries', date: '2024-01-15', type: 'expense' },
    { id: 3, amount: 100, category: 2, description: 'Fuel', date: '2024-01-15', type: 'expense' }
  ];

  const mockBalance = {
    total_income: 5000,
    total_expense: 300,
    balance: 4700
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more test cases as needed
});