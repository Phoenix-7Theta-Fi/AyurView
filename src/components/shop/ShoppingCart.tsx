
'use client';

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ShoppingCart() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getTotalItems,
    isCartOpen,
    setIsCartOpen
  } = useCart();
  const { toast } = useToast();

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    // Simulate order placement
    console.log("Order placed with items:", cartItems);
    console.log("Total amount:", getCartTotal().toFixed(2));

    toast({
      title: "Order Placed Successfully!",
      description: "Thank you for your purchase. Your Ayurvedic products are on their way!",
      variant: "default",
      duration: 5000,
    });
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-card text-card-foreground shadow-xl flex flex-col h-[90vh] sm:h-[80vh] max-h-[700px]">
        <DialogHeader className="pt-4 px-6">
          <DialogTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <ShoppingBag size={28} /> Your Shopping Cart
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review items and proceed to checkout.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow px-6 py-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Your cart is empty.</p>
              <p className="text-sm text-muted-foreground/80">Add some Ayurvedic goodness!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-b-0">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden shadow">
                    <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </Button>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => {
                            const newQuantity = parseInt(e.target.value, 10);
                            if (!isNaN(newQuantity)) {
                                updateQuantity(item.id, newQuantity);
                            }
                        }}
                        className="h-7 w-12 text-center px-1 border-input"
                        min="1"
                        max={item.stock}
                      />
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <p className="font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                     <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} />
                        <span className="sr-only">Remove item</span>
                     </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <div className="px-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-1">
              <p className="text-md text-muted-foreground">Subtotal ({getTotalItems()} items):</p>
              <p className="text-lg font-semibold text-foreground">${getCartTotal().toFixed(2)}</p>
            </div>
             <p className="text-xs text-muted-foreground/70 text-right mb-4">Shipping & taxes calculated at simulated checkout.</p>
            <Separator className="my-3" />
          </div>
        )}

        <DialogFooter className="px-6 pb-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              {cartItems.length > 0 ? 'Continue Shopping' : 'Close'}
            </Button>
          </DialogClose>
          {cartItems.length > 0 && (
            <Button 
              type="button" 
              onClick={handlePlaceOrder}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Place Order (No Payment)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
