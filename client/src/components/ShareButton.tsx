import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle, 
  Mail,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import {
  SiWhatsapp,
  SiTiktok,
  SiPinterest,
  SiReddit,
  SiTelegram,
} from 'react-icons/si';

interface ShareButtonProps {
  title: string;
  contentId: number;
  description?: string;
  imageUrl?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  children?: React.ReactNode;
}

const ShareButton = ({ 
  title, 
  contentId, 
  description = '',
  imageUrl = '',
  variant = 'outline', 
  size = 'default',
  className = '',
  showLabel = true,
  children
}: ShareButtonProps) => {
  const { toast } = useToast();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Generate the content URL
  const contentUrl = `${window.location.origin}/content/${contentId}`;
  
  // Generate the share URLs for different platforms
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}&quote=${encodeURIComponent(`Check out ${title} on StreamVerse!`)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(contentUrl)}&text=${encodeURIComponent(`I'm watching ${title} on StreamVerse! ${description?.substring(0, 100)}...`)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out ${title} on StreamVerse! ${contentUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(contentUrl)}&text=${encodeURIComponent(`Check out ${title} on StreamVerse!`)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(contentUrl)}&title=${encodeURIComponent(`Check out ${title} on StreamVerse!`)}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out ${title} on StreamVerse!`)}&body=${encodeURIComponent(`I thought you might enjoy this: ${title}\n\n${description}\n\nWatch it here: ${contentUrl}`)}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform];
    
    // Open the share URL in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Show success toast
    toast({
      title: "Shared successfully",
      description: `Content shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contentUrl);
      setIsCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      
      // Reset the copied state after a delay
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant}
            size={size} 
            className={className}
            aria-label="Share content"
          >
            {children || (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                {showLabel && "Share"}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => handleShare('facebook')}>
            <Facebook className="h-4 w-4 mr-2 text-blue-600" />
            <span>Facebook</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('twitter')}>
            <Twitter className="h-4 w-4 mr-2 text-sky-500" />
            <span>Twitter</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
            <SiWhatsapp className="h-4 w-4 mr-2 text-green-500" />
            <span>WhatsApp</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('telegram')}>
            <SiTelegram className="h-4 w-4 mr-2 text-blue-500" />
            <span>Telegram</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('reddit')}>
            <SiReddit className="h-4 w-4 mr-2 text-orange-600" />
            <span>Reddit</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('email')}>
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <span>Email</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsLinkDialogOpen(true)}>
            <LinkIcon className="h-4 w-4 mr-2" />
            <span>Copy Link</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Link</DialogTitle>
            <DialogDescription>
              Copy the link below to share "{title}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">Link</Label>
              <Input
                id="link"
                value={contentUrl}
                readOnly
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              size="icon" 
              onClick={copyToClipboard}
              className="px-3"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleShare('facebook')}>
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleShare('twitter')}>
                <Twitter className="h-4 w-4 mr-2 text-sky-500" />
                Twitter
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')}>
                <SiWhatsapp className="h-4 w-4 mr-2 text-green-500" />
                WhatsApp
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;