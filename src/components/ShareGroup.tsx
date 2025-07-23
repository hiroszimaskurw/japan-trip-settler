import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareGroupProps {
  shareCode: string;
  groupName: string;
}

export function ShareGroup({ shareCode, groupName }: ShareGroupProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}?join=${shareCode}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Skopiowano!',
        description: 'Link został skopiowany do schowka',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się skopiować linku',
        variant: 'destructive',
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rozliczenie: ${groupName}`,
          text: `Dołącz do rozliczania wydatków w grupie "${groupName}"`,
          url: shareUrl,
        });
      } catch (error) {
        // Użytkownik anulował udostępnianie
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Udostępnij
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Udostępnij grupę</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Wyślij ten link znajomym, aby mogli dołączyć do grupy:
            </p>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(shareUrl)}
                variant="outline"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Lub udostępnij kod grupy:
            </p>
            <div className="flex gap-2">
              <Input
                value={shareCode}
                readOnly
                className="flex-1 font-mono text-center text-lg"
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(shareCode)}
                variant="outline"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={shareNative} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Udostępnij
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}