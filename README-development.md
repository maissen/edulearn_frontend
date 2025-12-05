# Development Guide

This guide provides general information for developers working on the EduLearn platform.

## Project Overview

EduLearn is an educational platform built with Angular that allows students to enroll in courses, watch educational videos, and take tests. Teachers can create and manage courses with tests, while administrators have oversight capabilities.

## Technology Stack

- **Frontend Framework**: Angular 20
- **Language**: TypeScript
- **Styling**: CSS
- **Build Tool**: Angular CLI
- **Package Manager**: npm
- **Testing**: Jasmine/Karma

## Project Structure

```
src/
├── app/                 # Main application components
│   ├── auth/           # Authentication components (login/signup)
│   ├── courses/        # Course listing
│   ├── dashboard/      # User dashboards (student, teacher, admin)
│   ├── home/           # Home page
│   ├── shared/         # Shared components (navbar, footer)
│   └── app.*           # Root application files
├── services/           # API service layer
├── guards/             # Route guards
└── assets/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js (version specified in package.json)
- npm (comes with Node.js)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the development server:
```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Building

To build the project:
```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory.

### Running Tests

To execute unit tests:
```bash
npm test
# or
ng test
```

## Code Organization

### Components

Components follow the Angular standalone component pattern:
- Each component has its own directory
- Files include `.ts`, `.html`, `.css`, and `.spec.ts`
- Components are self-contained with their imports

### Services

Services are located in `src/services/` and handle:
- API communication
- Data processing
- Business logic

### Routing

Routes are defined in `src/app/app.routes.ts`:
- Lazy loading is used for most routes
- Route guards protect sensitive areas

## Coding Standards

### TypeScript

- Use strong typing wherever possible
- Follow Angular style guide recommendations
- Use dependency injection for services

### HTML/CSS

- Use semantic HTML
- Follow BEM naming convention for CSS classes
- Maintain responsive design principles

### Git Workflow

1. Create feature branches from `main`
2. Make small, focused commits
3. Write descriptive commit messages
4. Open pull requests for code review
5. Ensure tests pass before merging

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run watch` - Build and watch for changes
- `npm run serve:ssr` - Serve SSR build

## Environment Configuration

The application uses a single API base URL defined in `src/api.config.ts`:
```typescript
export const API_BASE_URL = 'http://79.137.34.134:5000';
```

## Adding New Features

1. Create a new component directory in the appropriate section
2. Implement the component using the standalone pattern
3. Add necessary routes in `app.routes.ts`
4. Create services if needed in `src/services/`
5. Add route guards if required
6. Write unit tests
7. Update documentation

## Deployment

The application is configured for SSR (Server-Side Rendering):
- Production builds generate server and browser bundles
- Use `npm run serve:ssr` to test SSR locally

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `angular.json` or kill the process using the port
2. **Missing dependencies**: Run `npm install` to ensure all packages are installed
3. **TypeScript errors**: Check that all types are properly defined

### Debugging Tips

1. Use browser developer tools to inspect network requests
2. Check the console for JavaScript errors
3. Use Angular DevTools extension for component debugging
4. Enable detailed logging in services for API issues

## Testing

### Unit Tests

Unit tests use Jasmine and Karma:
- Located alongside components with `.spec.ts` extension
- Test component logic, service methods, and utility functions
- Run with `npm test`

### Best Practices

1. Write tests for critical business logic
2. Mock external dependencies
3. Test both success and error cases
4. Keep tests focused and isolated

## Performance Considerations

1. Use lazy loading for routes
2. Optimize images and assets
3. Implement proper change detection strategies
4. Minimize bundle size by importing only necessary modules
5. Use Angular's built-in performance tools for profiling

## Accessibility

1. Use semantic HTML elements
2. Provide alt text for images
3. Ensure proper color contrast
4. Implement keyboard navigation
5. Use ARIA attributes where appropriate