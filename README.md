# SmartSpend - Personal Finance Tracker

A modern, AI-powered personal finance tracker built with React Native (Expo) that helps users manage their spending habits with intuitive insights and beautiful visualizations.

## 🚀 Features

### Core Features
- **Expense Management**: Add, edit, and delete transactions with categories, dates, and notes
- **Smart Dashboard**: Daily and monthly spending summaries with beautiful charts
- **Category Tracking**: Default categories (Food, Travel, Shopping, Health, Others) with custom category support
- **Local Storage**: Secure AsyncStorage for offline-first experience
- **AI-Powered Insights**: Intelligent spending pattern analysis and recommendations

### Next-Level AI Features
- **🧠 Need vs Want Classifier**: Automatically classify expenses as needs or wants with manual override
- **📊 Smart Budget Suggestions**: AI-generated budget recommendations based on spending patterns
- **⚠️ Daily Spend Forecast**: Calculate safe daily spending to stay within monthly budget
- **🎯 Savings Goals Tracker**: Create and track progress towards financial goals
- **🔔 Overspending Alerts**: Get notified when approaching budget limits

### Routine & Automation Features
- **⏰ Daily Reminders**: Set up push notifications to log expenses at your preferred time
- **🔄 Recurring Expenses**: Automate regular payments with customizable frequencies
- **📷 Receipt Scanner**: Scan receipts with OCR to automatically extract transaction data
- **📊 Monthly Reports**: Generate and email PDF reports of your spending patterns
- **💳 UPI Sync**: Auto-detect transactions from UPI payment apps
- **👥 Profile Manager**: Manage multiple profiles for personal, business, and shared expenses

### Visualization & Finance Planning Features
- **📊 Weekly & Monthly Charts**: Interactive bar, pie, and line charts for data visualization
- **📅 Calendar View**: Daily expense tracking with visual indicators and detailed day views
- **💰 Income Logging**: Track multiple income sources with categories and notes
- **📈 Cash Flow Analysis**: Monitor income vs expenses trends over time
- **🔄 Subscription Tracker**: Manage recurring subscriptions with alerts and auto-marking

### Advanced Features
- **Visual Analytics**: Pie charts and bar graphs for category breakdown
- **Search & Filter**: Find transactions quickly with search and category filters
- **Spending Insights**: AI-generated insights about spending patterns
- **Modern UI**: Clean, minimal design with smooth animations
- **Cross-Platform**: Works on iOS, Android, and Web

## 📱 Screenshots

The app features five main screens:

1. **Dashboard**: Overview with spending summaries, charts, and recent transactions
2. **Transactions**: Complete transaction list with search and filtering (includes AI classification badges)
3. **Insights**: AI-powered spending analysis and recommendations
4. **AI Features**: Comprehensive AI functionality including daily forecasts, budget suggestions, and savings goals
5. **Automation**: Routine features including reminders, recurring expenses, receipt scanning, and profile management
6. **Charts**: Visualization and finance planning features including charts, calendar view, income tracking, and subscription management

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Storage**: AsyncStorage for local data persistence
- **Charts**: react-native-chart-kit for data visualization
- **Icons**: Expo Vector Icons (Ionicons)
- **Navigation**: Custom tab-based navigation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartSpend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 🏗️ Project Structure

```
SmartSpend/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard with charts
│   │   ├── TransactionForm.tsx  # Add/edit transaction form
│   │   ├── TransactionsList.tsx # Transaction list with search
│   │   ├── Insights.tsx     # AI insights component
│   │   └── aiFeatures/      # AI feature components
│   │       ├── AIFeaturesScreen.tsx    # Main AI features screen
│   │       ├── ClassificationBadge.tsx # Need/want classification
│   │       ├── BudgetSuggestions.tsx   # AI budget recommendations
│   │       ├── DailyForecast.tsx       # Daily spending forecast
│   │       └── SavingsGoals.tsx        # Savings goals tracker
│   │   └── routineFeatures/ # Routine & automation components
│   │       ├── RoutineFeaturesScreen.tsx # Main automation screen
│   │       ├── ReminderSettings.tsx    # Daily reminder configuration
│   │       ├── RecurringExpenses.tsx   # Recurring expense management
│   │       ├── ReceiptScanner.tsx      # Receipt scanning with OCR
│   │       ├── MonthlyReports.tsx      # Monthly report generation
│   │       ├── UPISync.tsx             # UPI app synchronization
│   │       └── ProfileManager.tsx      # Multi-profile management
│   │   └── visualizationFeatures/ # Visualization & planning components
│   │       ├── VisualizationFeaturesScreen.tsx # Main visualization screen
│   │       ├── ChartViews.tsx          # Weekly and monthly chart components
│   │       ├── CalendarView.tsx        # Calendar view with daily transactions
│   │       ├── IncomeForm.tsx          # Income logging form
│   │       ├── CashFlowView.tsx        # Cash flow analysis component
│   │       └── SubscriptionTracker.tsx # Subscription management component
│   ├── services/            # AI and automation services
│   │   ├── aiClassification.ts # Expense classification logic
│   │   ├── budgetAI.ts      # Budget analysis and forecasting
│   │   ├── notifications.ts # Push notification management
│   │   ├── recurringExpenses.ts # Recurring expense processing
│   │   ├── ocrService.ts    # Receipt scanning and OCR
│   │   ├── monthlyReport.ts # PDF report generation
│   │   ├── upiSync.ts       # UPI transaction detection
│   │   └── profileManager.ts # Multi-profile management
│   ├── utils/               # Utility functions
│   │   ├── storage.ts       # AsyncStorage operations
│   │   ├── analytics.ts     # Data analysis and insights
│   │   ├── aiStorage.ts     # AI features storage
│   │   ├── routineStorage.ts # Routine features storage
│   │   └── visualizationStorage.ts # Visualization features storage
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts         # App-wide types
│   │   ├── aiFeatures.ts    # AI features types
│   │   ├── routineFeatures.ts # Routine features types
│   │   └── visualizationFeatures.ts # Visualization features types
│   └── constants/           # App constants
│       └── categories.ts    # Default categories
├── App.tsx                  # Main app component
└── README.md               # This file
```

## 🎯 Usage

### Adding Transactions
1. Tap the "+" button on any screen
2. Enter amount, select category, and date
3. Add optional notes
4. Save the transaction

### Viewing Analytics
- **Dashboard**: See daily/monthly totals and category breakdown
- **Charts**: Interactive pie and bar charts for spending analysis
- **Insights**: AI-generated recommendations and spending patterns

### AI Features
- **Need vs Want Classification**: Tap the classification badge on any transaction to categorize it
- **Daily Forecast**: Set a monthly budget and see how much you can safely spend today
- **Smart Budgets**: Get AI-generated budget suggestions based on your spending patterns
- **Savings Goals**: Create goals and track your progress with visual indicators

### Automation Features
- **Daily Reminders**: Configure push notifications to remind you to log expenses
- **Recurring Expenses**: Set up automatic recurring transactions with custom frequencies
- **Receipt Scanning**: Use the camera to scan receipts and automatically extract transaction data
- **Monthly Reports**: Generate detailed PDF reports and email them to yourself
- **UPI Sync**: Connect your UPI apps to automatically detect and categorize transactions
- **Profile Management**: Create and switch between multiple profiles for different use cases

### Visualization Features
- **Charts & Analytics**: View weekly and monthly data in interactive tables with insights
- **Calendar View**: Browse daily transactions in a calendar format with visual indicators
- **Income Management**: Log and track multiple income sources with categories
- **Cash Flow Analysis**: Monitor your financial trends and patterns over time
- **Subscription Tracking**: Manage recurring subscriptions with renewal reminders

### Managing Transactions
- **Search**: Use the search bar to find specific transactions
- **Filter**: Filter by category using the category chips
- **Edit**: Tap the edit button on any transaction
- **Delete**: Tap the delete button with confirmation

## 🔧 Configuration

### Custom Categories
The app comes with 5 default categories. You can add custom categories by modifying the `DEFAULT_CATEGORIES` array in `src/constants/categories.ts`.

### Storage
All data is stored locally using AsyncStorage. For cloud sync, you can extend the storage utilities in `src/utils/storage.ts` to integrate with Firebase or other cloud services.

## 🧠 AI Insights

The app provides intelligent insights including:
- **High Spending Days**: Identifies days with unusually high spending
- **Category Trends**: Shows your top spending categories
- **Savings Suggestions**: Recommends ways to save money
- **Spending Patterns**: Analyzes your spending behavior over time

## 🎨 Design Principles

- **Minimal**: Clean, uncluttered interface
- **Intuitive**: Easy-to-use navigation and interactions
- **Visual**: Rich charts and visual feedback
- **Responsive**: Works seamlessly across different screen sizes
- **Accessible**: Clear typography and contrast ratios

## 🔮 Future Enhancements

- [ ] Firebase integration for cloud sync
- [ ] Budget setting and tracking
- [ ] Export functionality (CSV, PDF)
- [ ] Multiple currency support
- [ ] Dark mode theme
- [ ] Advanced receipt OCR with machine learning
- [ ] Integration with banking APIs
- [ ] Social sharing of financial goals
- [ ] Voice commands for expense logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Charts powered by [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- Icons from [Ionicons](https://ionic.io/ionicons)

---

**SmartSpend** - Your intelligent companion for better financial management! 💰✨ 