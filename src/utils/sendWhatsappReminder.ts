
export const sendWhatsappReminder = (phone: string, message: string, useAPI: boolean = false) => {
  if (useAPI) {
    // Example for API usage (e.g., Twilio, Meta)
    return fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("נשלח דרך API:", data);
        return data;
      })
      .catch((err) => {
        console.error("שגיאה בשליחה:", err);
        throw err;
      });
  } else {
    // רגיל - פתיחה בוואטסאפ דפדפן
    const encodedMsg = encodeURIComponent(message);
    const cleanedPhone = phone.replace(/[^0-9]/g, "");
    
    // Add country code if not present
    const formattedPhone = cleanedPhone.startsWith('972') ? cleanedPhone : `972${cleanedPhone.startsWith('0') ? cleanedPhone.slice(1) : cleanedPhone}`;
    
    const url = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
    
    try {
      window.open(url, "_blank");
      return Promise.resolve({ 
        success: true, 
        method: 'browser',
        phone: formattedPhone,
        url 
      });
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      throw error;
    }
  }
};

// Check if WhatsApp API is available/configured
export const checkWhatsAppAPIAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/whatsapp-status", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.available === true;
    }
    
    return false;
  } catch (error) {
    console.log("WhatsApp API לא זמין, משתמש בדפדפן");
    return false;
  }
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/[^0-9]/g, "");
  
  // Israeli phone number validation
  if (cleanedPhone.startsWith('972')) {
    return cleanedPhone.length >= 12 && cleanedPhone.length <= 13;
  }
  
  if (cleanedPhone.startsWith('0')) {
    return cleanedPhone.length === 10;
  }
  
  return cleanedPhone.length === 9;
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanedPhone = phone.replace(/[^0-9]/g, "");
  
  if (cleanedPhone.startsWith('972')) {
    return `+${cleanedPhone}`;
  }
  
  if (cleanedPhone.startsWith('0')) {
    return cleanedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return `0${cleanedPhone}`.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};
