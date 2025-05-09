
'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

export default function ShoppingCartIcon() {
  const { getTotalItems, setIsCartOpen } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = getTotalItems();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-foreground hover:bg-primary/10 hover:text-primary"
      onClick={() => setIsCartOpen(true)}
      aria-label="Open shopping cart"
    >
      <ShoppingCart size={22} />
      {isClient && totalItems > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
        >
          {totalItems > 9 ? '9+' : totalItems}
        </Badge>
      )}
    </Button>
  );
}

