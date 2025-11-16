import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { Users, ExternalLink, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function CommunityForum() {
  const { t } = useLanguage();

  const handleWhatsAppGroupClick = () => {
    const whatsappGroupUrl = `https://chat.whatsapp.com/INVITE_LINK_HERE`;
    window.open(whatsappGroupUrl, '_blank');
  };

  const communityStats = [
    { label: 'Active Members', value: '250+', icon: Users },
    { label: 'Daily Messages', value: '150+', icon: MessageCircle },
    { label: 'Success Stories', value: '80+', icon: TrendingUp },
  ];

  const communityBenefits = [
    {
      title: 'Share Your Journey',
      description: 'Post your progress, achievements, and transformation photos',
      icon: TrendingUp,
    },
    {
      title: 'Get Motivated',
      description: 'Connect with members who share similar fitness goals',
      icon: Heart,
    },
    {
      title: 'Exchange Tips',
      description: 'Learn from others\' experiences and share your own insights',
      icon: MessageCircle,
    },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">{t('comm.communityForum')}</h1>
          <p className="text-muted-foreground mt-1">
            Join our WhatsApp community and connect with fellow fitness enthusiasts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {communityStats.map((stat, index) => (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display" data-testid={`text-stat-value-${index}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-stat-label-${index}`}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card data-testid="card-join-community">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <FaWhatsapp className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">Join Our WhatsApp Community</CardTitle>
                <CardDescription className="text-base mt-1">
                  Connect, share, and grow together with the FitPro family
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Button 
                onClick={handleWhatsAppGroupClick}
                className="w-full sm:w-auto gap-2"
                size="lg"
                data-testid="button-join-whatsapp-group"
              >
                <FaWhatsapp className="h-5 w-5" />
                Join WhatsApp Group
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">What You'll Get</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {communityBenefits.map((benefit, index) => (
                  <div key={index} className="space-y-2" data-testid={`card-benefit-${index}`}>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-primary/10">
                        <benefit.icon className="h-4 w-4 text-primary" />
                      </div>
                      <h4 className="font-medium" data-testid={`text-benefit-title-${index}`}>
                        {benefit.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`text-benefit-desc-${index}`}>
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-community-guidelines">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Be respectful and supportive of all members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Share fitness-related content and experiences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>No spam, advertising, or promotional content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Keep conversations positive and motivating</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Protect your privacy - avoid sharing sensitive personal information</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50" data-testid="card-note">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> The WhatsApp group link will be provided by your gym administrator. 
              If you haven't received the invite link yet, please contact support or your trainer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
