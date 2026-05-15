const COUPON_FORMAT = /^[A-Z0-9]{4,12}$/;

function validateCoupon(couponCode, orderAmount, couponsData) {
  const normalizedCode = String(couponCode || '').trim().toUpperCase();

  if (!COUPON_FORMAT.test(normalizedCode)) {
    return { valid: false, error: 'Invalid coupon format' };
  }

  const coupon = couponsData.coupons.find(c => c.code.toUpperCase() === normalizedCode);

  if (!coupon) {
    return { valid: false, error: 'Coupon not found' };
  }

  // Check if expired ag coupon
  const expiryDate = new Date(coupon.expiryDate);
  if (new Date() > expiryDate) {
    return { valid: false, error: 'Coupon expired' };
  }

  if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  if (orderAmount < coupon.minOrderAmount) {
    return { valid: false, error: `Minimum order amount ${coupon.minOrderAmount} required` };
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderAmount * coupon.discount) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discount;
  }

  return {
    valid: true,
    coupon: coupon,
    discountAmount: discountAmount,
    finalAmount: Math.max(0, orderAmount - discountAmount),
  };
}

function applyDiscount(coupon, orderAmount) {
  if (coupon.discountType === 'percentage') {
    return (orderAmount * coupon.discount) / 100;
  } else {
    return coupon.discount;
  }
}

module.exports = {
  validateCoupon,
  applyDiscount,
};
