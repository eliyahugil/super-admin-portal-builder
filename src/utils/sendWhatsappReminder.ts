
export const sendWhatsappReminder = (phone: string, message: string, useAPI: boolean = false) => {
  if (useAPI) {
    // Example for API usage (e.g., Twilio, Meta)
    return fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    })
      .then((res) => res.json())
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
    const url = `https://wa.me/${cleanedPhone}?text=${encodedMsg}`;
    window.open(url, "_blank");
    return Promise.resolve({ success: true, method: 'browser' });
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
