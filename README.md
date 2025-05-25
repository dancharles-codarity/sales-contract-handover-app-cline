# Sales Contract Handover Application

A comprehensive React-based web application designed to streamline the sales-to-finance handover process for a UK-based marketing services company. This application replaces manual spreadsheets with an automated 5-step form that handles complex VAT calculations and payment schedules.

## 🚀 Features

- **5-Step Guided Form Process**
  - Client & Sales Representative Information
  - Service Selection (Full Package vs Individual Services)
  - Financial Inputs with Real-time Calculations
  - Payment Structure & Collection
  - Summary Review & Submission

- **Automated Calculations**
  - VAT calculations (20% for UK clients, 0% for Non-UK)
  - Tiered ad spend management fees
  - Payment schedule breakdowns for 3 different options

- **Data Export & Integration**
  - CSV export with finance-friendly column names
  - Zapier webhook integration for automated workflows
  - Comprehensive data validation

- **Professional UI/UX**
  - Responsive design with Tailwind CSS
  - Step-by-step progress indicator
  - Real-time validation and error handling

## 🛠️ Technology Stack

- **Frontend:** React 18 with Hooks
- **Styling:** Tailwind CSS
- **Build Tool:** Create React App
- **Deployment:** Netlify-ready configuration
- **Integration:** Zapier webhook support

## 📋 Business Logic

### VAT Calculations
- UK clients: 20% VAT applied to all fees
- Non-UK clients: 0% VAT (VAT-exempt)
- Real-time calculation updates as user inputs data

### Ad Spend Management Fee Tiers
- £5,000 - £10,000: £500
- £10,001 - £15,000: £900
- £15,001 - £20,000: £1,400
- £20,001 - £25,000: £1,500
- £25,001 - £30,000: £1,500
- £30,001 - £35,000: £1,750
- £35,001 - £40,000: £2,000
- £40,001 - £45,000: £2,250
- £45,001 - £50,000: £2,500
- £50,000+: £2,500 (capped)

### Payment Options
- **Option A:** 100% upfront payment
- **Option B:** 50% + onboarding upfront, then 2 monthly payments
- **Option C:** Monthly payments over 4 months + onboarding upfront

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation
1. Clone the repository
```bash
git clone <your-repo-url>
cd sales-contract-handover-app
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production
```bash
npm run build
```

## 🌐 Deployment

### Netlify Deployment
1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically detect the build settings from `netlify.toml`
4. Your app will be deployed automatically

### Manual Deployment
1. Run `npm run build`
2. Upload the `build` folder contents to your web server

## ⚙️ Configuration

### Zapier Webhook
Update the `ZAPIER_WEBHOOK_URL` constant in `src/App.js` with your actual Zapier webhook URL:

```javascript
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/your-actual-webhook-url';
```

## 📊 Data Export

The application generates CSV files with the following structure:
- Client information and contact details
- Service selection and package type
- Financial calculations (with and without VAT)
- Payment schedule breakdowns
- Ad budget and management fees
- Handover notes for finance team

**CSV Filename Format:** `{ClientName}_{AgreementDate}_SalesContractInfo.csv`

## 🔒 Data Validation

- **Email Format:** Standard email validation
- **UK Postcodes:** Format validation (e.g., SW1A 1AA)
- **US Zipcodes:** Format validation (e.g., 12345 or 12345-6789)
- **Numeric Fields:** Proper number validation for all financial inputs
- **Required Fields:** Comprehensive validation for all mandatory fields

## 🎨 Customization

### Styling
The application uses Tailwind CSS with custom component classes defined in `src/index.css`. You can customize:
- Color scheme by updating the Tailwind config
- Component styles in the CSS file
- Layout and spacing

### Business Logic
Key calculation functions are in `src/App.js`:
- `calculateValues()` - Main calculation engine
- VAT rate configuration
- Ad spend management fee tiers
- Payment option calculations

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software developed for internal business use.

## 📞 Support

For technical support or questions about the application, contact the development team.

---

**Built with ❤️ for streamlined sales-to-finance handovers**
