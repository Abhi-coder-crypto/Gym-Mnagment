import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/language-context';
import { MessageSquare, ExternalLink, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface TrainerInfo {
  name: string;
  phone: string;
  email?: string;
  specialization?: string;
  bio?: string;
}

export default function TrainerMessaging() {
  const { t } = useLanguage();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    setClientId(id);
  }, []);

  const { data: client } = useQuery<any>({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId,
  });

  const trainerInfo: TrainerInfo = {
    name: 'HOC Trainer',
    phone: '+1234567890',
    specialization: 'Strength & Conditioning',
    bio: 'Certified personal trainer with 10+ years of experience helping clients achieve their fitness goals.',
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = trainerInfo.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${trainerInfo.name}, I'm ${client?.name || 'a FitPro member'} and I'd like to discuss my training.`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t('comm.trainerMessaging')}</h1>
          <p className="text-muted-foreground mt-1">
            Connect directly with your personal trainer
          </p>
        </div>

        <Card data-testid="card-trainer-info">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {trainerInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-1" data-testid="text-trainer-name">
                  {trainerInfo.name}
                </CardTitle>
                <CardDescription className="text-base" data-testid="text-trainer-specialization">
                  {trainerInfo.specialization}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">About Your Trainer</h3>
              <p className="text-muted-foreground" data-testid="text-trainer-bio">
                {trainerInfo.bio}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Contact Your Trainer</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <span data-testid="text-trainer-phone">{trainerInfo.phone}</span>
                </div>

                <Button 
                  onClick={handleWhatsAppClick}
                  className="w-full sm:w-auto gap-2"
                  size="lg"
                  data-testid="button-whatsapp-trainer"
                >
                  <FaWhatsapp className="h-5 w-5" />
                  Chat on WhatsApp
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <p className="text-sm text-muted-foreground">
                  Click the button above to start a direct WhatsApp conversation with your trainer. You can discuss your workout plans, ask questions, and get personalized guidance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-messaging-tips">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messaging Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Be specific about your questions or concerns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Share photos or videos of your form if needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Your trainer typically responds within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Schedule check-ins to stay on track with your goals</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
