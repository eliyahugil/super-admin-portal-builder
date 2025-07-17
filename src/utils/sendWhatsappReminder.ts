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

// Helper function specifically for shift tokens
export const sendShiftTokenWhatsapp = async ({
  phone,
  employeeName,
  employeeId,
  tokenUrl,
  useAPI,
  isAdvanced = false
}: {
  phone: string;
  employeeName: string;
  employeeId: string;
  tokenUrl: string;
  useAPI: boolean;
  isAdvanced?: boolean;
}) => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
  
  const systemType = isAdvanced ? 'המתקדמת' : '';
  const features = isAdvanced 
    ? '\n📅 לוח זמנים אינטראקטיבי\n🎯 בחירת משמרות מתקדמת\n🏖️ בקשות חופשה\n📊 סיכום ודוחות'
    : '';
  
  const message = 
    `שלום ${employeeName}! 👋\n\n` +
    `🗓️ *קישור למשמרות השבועיות*\n\n` +
    `קישור לצפייה במשמרות לשבוע הקרוב:\n` +
    `${tokenUrl}\n\n` +
    `💡 *מידע חשוב:*\n` +
    `• הקישור יציג משמרות זמינות לפני הפרסום\n` +
    `• לאחר פרסום המשמרות תוכל לראות את המשמרות שהוקצו לך\n` +
    `• הקישור תקף למשך שבוע ומתעדכן אוטומטית\n\n` +
    (isAdvanced ? `✨ המערכת המתקדמת כוללת:${features}\n\n` : '') +
    `בהצלחה! 🍀`;

  if (useAPI) {
    // WhatsApp API integration would go here
    console.log('Sending via WhatsApp API:', { phone: whatsappPhone, message });
    
    // For now, just simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
