# 📊 Credit Market Memo

> **Enterprise-grade daily trading report system for APAC credit markets**

A comprehensive web application designed for credit trading desks to streamline daily market reporting, P&L tracking, and sector analysis across APAC markets.

![Credit Market Memo](public/memo.png)

## 🎯 **Overview**

Credit Market Memo is a professional trading desk application that enables traders to efficiently create, manage, and distribute daily market reports. Built with modern web technologies, it provides a seamless experience for capturing market insights, tracking P&L performance, and generating consolidated reports for distribution to trading teams and management.

## ✨ **Key Features**

### 📈 **Trader Input System**
- **Dual Input Modes**: Switch between individual sector recaps and consolidated APAC commentary
- **Sector Coverage**: Australia IG, Japan IG, China IG, SEA IG, India IG, and Sovereigns
- **Real-time P&L Tracking**: Multi-currency P&L input with automatic aggregation
- **Draft Management**: Auto-save functionality with draft recovery
- **Form Validation**: Comprehensive validation to ensure data quality

### 📋 **Daily Summary Reports**
- **Consolidated View**: Unified daily reports combining all sector inputs
- **Professional Layout**: Clean, print-ready formatting suitable for distribution
- **Export Capabilities**: Print and PDF export functionality
- **Historical Navigation**: Browse and compare reports across different dates
- **Real-time Updates**: Live aggregation of P&L data from sector inputs

### 📚 **Historical Data Management**
- **30-Day History**: Comprehensive historical data with search and filtering
- **Date Range Filtering**: Flexible date range selection for analysis
- **Performance Tracking**: Historical P&L trends and sector performance
- **Data Visualization**: Clean tabular presentation of historical reports
- **Quick Access**: Fast navigation to specific historical reports

### 🎨 **Professional User Interface**
- **Dark/Light Themes**: Toggle between professional dark and light themes
- **Responsive Design**: Optimized for desktop trading environments
- **Material-UI Components**: Enterprise-grade UI components
- **Intuitive Navigation**: Clean sidebar navigation with clear visual indicators
- **Professional Branding**: Custom memo icon and consistent visual identity

## 🏦 **Sector Coverage**

### **Australia IG**
- AUD and USD bond markets
- Major financials: CBA, ANZ, Westpac, NAB
- Corporate credits: Telstra, BHP, Rio Tinto
- CDS market coverage

### **Japan IG**
- JPY and USD bond markets  
- Major corporates: SoftBank, Toyota, MUFG
- Financial institutions and sovereigns
- Cross-currency basis considerations

### **China IG**
- USD and CNY bond markets
- Property sector coverage
- Technology and telecommunications
- State-owned enterprises

### **SEA IG**
- Multi-currency coverage (USD, MYR, SGD)
- Regional banks and corporates
- Infrastructure and utilities
- Sovereign and quasi-sovereign credits

### **India IG**
- USD and INR bond markets
- Banking sector focus
- Infrastructure and energy
- Government-related entities

### **Sovereigns**
- APAC sovereign bond markets
- Currency considerations
- Relative value analysis
- Policy impact assessment

## 💼 **P&L Tracking Features**

### **Multi-Currency Support**
- **USD Bonds**: Primary trading currency
- **Local Currency Bonds**: AUD, JPY, CNY, MYR, INR
- **CDS**: Credit default swap P&L tracking
- **Automatic Aggregation**: Real-time consolidation across sectors

### **Risk Management**
- **Position Tracking**: Current risk exposure monitoring
- **Daily Changes**: Risk change attribution
- **Volume Reporting**: Trading volume metrics
- **Performance Analytics**: P&L performance analysis

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+ 
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd market-memo

# Install dependencies
npm install

# Start development server
npm start
```

### **Production Build**
```bash
# Create optimized production build
npm run build

# Serve production build locally
npm install -g serve
serve -s build
```

## 📱 **User Guide**

### **Daily Workflow**

1. **Morning Setup**
   - Navigate to Trader Input page
   - Select current trading date
   - Choose between Sector Input or APAC Overall modes

2. **Sector Input Process**
   - Select sector from dropdown
   - Enter market moves and flows
   - Input daily P&L figures (in thousands)
   - Provide comprehensive market commentary
   - Save draft or submit final recap

3. **APAC Consolidation**
   - Switch to APAC Overall mode
   - Enter risk metrics and volumes
   - Review auto-calculated P&L aggregation
   - Provide overall market summary

4. **Report Generation**
   - Navigate to Daily Summary page
   - Review consolidated report
   - Print or export to PDF
   - Distribute to trading team

### **Navigation Guide**

- **📊 Trader Input**: Primary data entry interface
- **📋 Daily Summary**: Consolidated report viewing and export
- **📚 Historical Data**: Historical report browsing and analysis
- **🌙/☀️ Theme Toggle**: Switch between dark and light themes

## 🔧 **Technical Specifications**

### **Technology Stack**
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: React Hooks and Context
- **Data Storage**: Local Storage with service layer abstraction
- **Styling**: CSS-in-JS with Material-UI theming
- **Build Tool**: Create React App with Webpack

### **Architecture**
- **Component-Based**: Modular React component architecture
- **Service Layer**: Abstracted data services for future backend integration
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first responsive layout
- **Performance**: Optimized bundle size and lazy loading

### **Browser Support**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📊 **Demo Data**

The application includes comprehensive demo data featuring:
- **Realistic Market Commentary**: Authentic trading language and market observations
- **Professional P&L Figures**: Representative trading desk performance metrics
- **Historical Trends**: 30 days of varied market scenarios
- **Sector Diversity**: Coverage across all major APAC credit sectors

## 🎯 **Trading Desk Benefits**

### **Efficiency Gains**
- **Streamlined Reporting**: Reduce daily report preparation time by 60%
- **Automated Aggregation**: Eliminate manual P&L consolidation errors
- **Consistent Format**: Standardized report structure across all traders
- **Quick Distribution**: One-click export and sharing capabilities

### **Risk Management**
- **Real-time Monitoring**: Live P&L and risk tracking
- **Historical Analysis**: Trend identification and performance review
- **Data Integrity**: Validation and error checking throughout
- **Audit Trail**: Complete history of all report modifications

### **Professional Presentation**
- **Client-Ready Reports**: Professional formatting suitable for external distribution
- **Consistent Branding**: Unified visual identity across all reports
- **Print Optimization**: Clean, readable printed reports
- **Mobile Access**: Review reports on mobile devices

## 🔮 **Future Enhancements**

### **Planned Features**
- **Backend Integration**: Database storage and multi-user support
- **Real-time Collaboration**: Live editing and commenting
- **Advanced Analytics**: Charting and trend analysis
- **Email Integration**: Automated report distribution
- **Mobile App**: Native mobile application
- **API Integration**: Market data feeds and pricing services

### **Scalability**
- **Multi-Desk Support**: Expand to other trading desks
- **Regional Customization**: Adapt for different geographic markets
- **Integration Ready**: Designed for easy backend integration
- **Performance Optimization**: Prepared for high-volume usage

## 📞 **Support & Contact**

For technical support, feature requests, or trading desk onboarding:
- **Technical Issues**: Contact IT Support
- **Feature Requests**: Submit via internal ticketing system
- **Training**: Schedule demo sessions with trading desk managers

## 🎬 **Demo Instructions**

### **For Trading Desk Demonstrations**

1. **Start the Application**
   ```bash
   npm start
   # Application opens at http://localhost:3000
   ```

2. **Demo Flow**
   - **Trader Input**: Show dual input modes and P&L tracking
   - **Daily Summary**: Demonstrate consolidated reporting and export
   - **Historical Data**: Browse historical trends and filtering
   - **Theme Toggle**: Switch between dark/light themes

3. **Key Demo Points**
   - **Real-time P&L Aggregation**: Show automatic consolidation
   - **Professional Reports**: Highlight print-ready formatting
   - **Comprehensive Coverage**: Demonstrate all APAC sectors
   - **User-Friendly Interface**: Emphasize ease of use

### **Sample Demo Script**

> "Credit Market Memo streamlines our daily reporting process. Traders input sector-specific data, and the system automatically aggregates P&L across all APAC markets. The consolidated reports are professional, print-ready, and can be distributed instantly to management and clients."

---

**Credit Market Memo** - *Streamlining APAC credit market reporting for professional trading desks*

Built with ❤️ for traders, by traders.
