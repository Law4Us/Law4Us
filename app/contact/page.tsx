import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button, FormField, Input, Textarea } from "@/components/ui";

export const metadata: Metadata = {
  title: "צור קשר - Law4Us",
  description: "צרו קשר עם משרד עורכי הדין שלנו. אנחנו כאן לענות על כל שאלה ולסייע בהליך.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-white">
        <div className="container-custom section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display font-bold mb-6">
              צור קשר
              <br />
              <span className="text-primary">נשמח לעזור</span>
            </h1>
            <p className="text-body-large text-neutral-dark">
              השאירו פרטים ונחזור אליכם בהקדם האפשרי
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-neutral-lightest">
        <div className="container-custom section-padding">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-h2 font-bold mb-6">שלחו לנו הודעה</h2>
              <form className="space-y-6">
                <FormField label="שם מלא" htmlFor="name" required>
                  <Input id="name" placeholder="הקלידו כאן שם מלא" />
                </FormField>

                <FormField label="טלפון" htmlFor="phone" required>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="050-123-4567"
                  />
                </FormField>

                <FormField label="כתובת מייל" htmlFor="email" required>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com"
                  />
                </FormField>

                <FormField label="הודעה" htmlFor="message" required>
                  <Textarea
                    id="message"
                    placeholder="כתבו כאן את ההודעה שלכם..."
                    rows={5}
                  />
                </FormField>

                <div className="text-caption text-neutral-dark">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      required
                    />
                    <span>
                      אני מסכים/ה לקבל תקשורת מהמשרד לצורך מתן שירות ועדכונים רלוונטיים
                    </span>
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  שלח הודעה
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-h2 font-bold mb-6">פרטי התקשרות</h2>
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold mb-1">כתובת</h3>
                    <p className="text-body text-neutral-dark">
                      יגאל אלון 26, תל אביב
                      <br />
                      קומה 5
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold mb-1">טלפון</h3>
                    <a
                      href="tel:035555555"
                      className="text-body text-primary hover:underline"
                    >
                      03-5555555
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold mb-1">אימייל</h3>
                    <a
                      href="mailto:info@law4us.co.il"
                      className="text-body text-primary hover:underline"
                    >
                      info@law4us.co.il
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold mb-1">שעות פעילות</h3>
                    <p className="text-body text-neutral-dark">
                      ראשון - חמישי: 09:00 - 18:00
                      <br />
                      שישי: 09:00 - 13:00
                      <br />
                      שבת: סגור
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-neutral-light rounded-lg h-64 flex items-center justify-center text-neutral-dark">
                <p className="text-body">מפה להמחשה</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
