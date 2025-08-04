# Contact Form Setup Guide

## Current Implementation

I've created a working contact form with:
- Beautiful, responsive design
- Client-side validation
- API endpoint ready for integration
- Success/error messaging

## How It Works

1. **Frontend** (`/contact`):
   - Collects: Name, Email, Phone, Service, Message
   - Validates required fields
   - Shows loading states
   - Displays success/error messages

2. **API Endpoint** (`/api/contact`):
   - Receives POST requests
   - Validates data
   - Ready for email integration

## Integration Options

### Option 1: Direct Email (Simplest)
Use a service like EmailJS or Formspree:

```javascript
// In contact.ts
await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Option 2: SendGrid Integration
Since you already have SendGrid in Django:

```javascript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'tony.cooper@webuildstores.co.uk',
  from: 'noreply@webuildstores.co.uk',
  subject: `New Contact: ${data.name}`,
  text: `
    Name: ${data.name}
    Email: ${data.email}
    Phone: ${data.phone || 'Not provided'}
    Service: ${data.service || 'Not specified'}
    
    Message:
    ${data.message}
  `,
  html: `<h2>New Contact Form Submission</h2>...`
};

await sgMail.send(msg);
```

### Option 3: Django Backend Integration
Connect to your existing Django system:

```javascript
// In contact.ts
const response = await fetch('https://conductor.webuildstores.co.uk/api/contact/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DJANGO_API_KEY}`
  },
  body: JSON.stringify(data)
});
```

### Option 4: Netlify Forms (If hosting on Netlify)
Just add `netlify` attribute to your form:

```html
<form netlify name="contact" id="contact-form">
  <!-- Your fields -->
</form>
```

## Environment Variables

Add to `.env`:
```
SENDGRID_API_KEY=your_key_here
DJANGO_API_URL=https://conductor.webuildstores.co.uk
DJANGO_API_KEY=your_api_key
```

## Testing

The form currently logs to console in development. To test:
1. Fill out the form
2. Submit
3. Check browser console for the data
4. See success message

## Next Steps

1. Choose your preferred integration method
2. Add environment variables
3. Update the API endpoint
4. Test with real emails

The beauty? Unlike WordPress contact forms that need plugins, this is just clean code you control!