let razorpayLoaded = false;

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (razorpayLoaded) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      razorpayLoaded = true;
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      razorpayLoaded = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};