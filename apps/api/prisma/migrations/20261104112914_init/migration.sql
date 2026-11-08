-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'CENTRAL_ADMIN', 'OUTLET_MANAGER', 'KITCHEN_STAFF', 'CATERING_MANAGER');

-- CreateEnum
CREATE TYPE "OutletStaffRole" AS ENUM ('MANAGER', 'KITCHEN_STAFF', 'CATERING_MANAGER');

-- CreateEnum
CREATE TYPE "FoodType" AS ENUM ('VEG', 'NON_VEG');

-- CreateEnum
CREATE TYPE "SpiceLevel" AS ENUM ('MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'AWAITING_DELIVERY_PARTNER', 'HANDED_OFF', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('CUSTOMER_REQUEST', 'OUTLET_UNAVAILABLE', 'PAYMENT_FAILED', 'LATE_PREPARATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PrepEstimateSource" AS ENUM ('AI', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "KitchenAlertType" AS ENUM ('LATE_ORDER', 'PREP_TIME_OVERRIDE');

-- CreateEnum
CREATE TYPE "KitchenAlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PartyOrderRequestStatus" AS ENUM ('PENDING', 'REVIEWING', 'QUOTED', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "landmark" TEXT,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Hyderabad',
    "state" TEXT NOT NULL DEFAULT 'Telangana',
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "isCloudKitchen" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minimumPrepTimeMin" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffOutlet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "role" "OutletStaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffOutlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "foodType" "FoodType" NOT NULL,
    "spiceLevel" "SpiceLevel",
    "allergens" TEXT[],
    "imageUrl" TEXT,
    "prepTimeMin" INTEGER NOT NULL DEFAULT 15,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuVariant" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemAddon" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItemAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletMenuItem" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletVariantPrice" (
    "id" TEXT NOT NULL,
    "outletMenuItemId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletVariantPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletAddonPrice" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletAddonPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAvailabilityRule" (
    "id" TEXT NOT NULL,
    "outletMenuItemId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuAvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'DELIVERY',
    "couponId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "outletMenuItemId" TEXT NOT NULL,
    "outletVariantPriceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItemAddon" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "outletAddonPriceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItemAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "CouponDiscountType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "perUserLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "fulfillmentType" "FulfillmentType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "deliveryAddressSnapshot" JSONB,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "addonTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "couponId" TEXT,
    "couponCode" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "promisedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "handedOffAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemName" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "foodType" "FoodType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemAddon" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "addonName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemAddon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT NOT NULL DEFAULT 'MOCK',
    "transactionRef" TEXT,
    "failureReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "note" TEXT,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderCancellation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "reason" "CancellationReason" NOT NULL,
    "details" TEXT,
    "cancelledByUserId" TEXT,
    "refundAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepTimeEstimate" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "source" "PrepEstimateSource" NOT NULL,
    "reason" TEXT,
    "kitchenLoad" INTEGER,
    "activeOrderCount" INTEGER,
    "estimatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,

    CONSTRAINT "PrepTimeEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenAlert" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "KitchenAlertType" NOT NULL,
    "status" "KitchenAlertStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "KitchenAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitchenOrderNote" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitchenOrderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyOrderRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "outletId" TEXT,
    "managerId" TEXT,
    "eventAt" TIMESTAMP(3) NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "eventType" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Hyderabad',
    "state" TEXT NOT NULL DEFAULT 'Telangana',
    "postalCode" TEXT NOT NULL,
    "specialRequests" TEXT,
    "dietaryNotes" TEXT,
    "status" "PartyOrderRequestStatus" NOT NULL DEFAULT 'PENDING',
    "quoteAmount" DECIMAL(10,2),
    "quotedAt" TIMESTAMP(3),
    "managerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyOrderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_role_idx" ON "UserRoleAssignment"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_role_key" ON "UserRoleAssignment"("userId", "role");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_postalCode_idx" ON "Address"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "City_code_key" ON "City"("code");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_key" ON "City"("name", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Outlet_code_key" ON "Outlet"("code");

-- CreateIndex
CREATE INDEX "Outlet_cityId_idx" ON "Outlet"("cityId");

-- CreateIndex
CREATE INDEX "Outlet_postalCode_idx" ON "Outlet"("postalCode");

-- CreateIndex
CREATE INDEX "StaffOutlet_outletId_role_idx" ON "StaffOutlet"("outletId", "role");

-- CreateIndex
CREATE INDEX "StaffOutlet_userId_idx" ON "StaffOutlet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffOutlet_userId_outletId_role_key" ON "StaffOutlet"("userId", "outletId", "role");

-- CreateIndex
CREATE INDEX "MenuCategory_sortOrder_idx" ON "MenuCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_name_key" ON "MenuCategory"("name");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_isPublished_idx" ON "MenuItem"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX "MenuItem_foodType_idx" ON "MenuItem"("foodType");

-- CreateIndex
CREATE INDEX "MenuVariant_menuItemId_sortOrder_idx" ON "MenuVariant"("menuItemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MenuVariant_menuItemId_name_key" ON "MenuVariant"("menuItemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Addon_name_key" ON "Addon"("name");

-- CreateIndex
CREATE INDEX "MenuItemAddon_addonId_idx" ON "MenuItemAddon"("addonId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemAddon_menuItemId_addonId_key" ON "MenuItemAddon"("menuItemId", "addonId");

-- CreateIndex
CREATE INDEX "OutletMenuItem_outletId_isAvailable_idx" ON "OutletMenuItem"("outletId", "isAvailable");

-- CreateIndex
CREATE INDEX "OutletMenuItem_menuItemId_idx" ON "OutletMenuItem"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletMenuItem_outletId_menuItemId_key" ON "OutletMenuItem"("outletId", "menuItemId");

-- CreateIndex
CREATE INDEX "OutletVariantPrice_variantId_idx" ON "OutletVariantPrice"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletVariantPrice_outletMenuItemId_variantId_key" ON "OutletVariantPrice"("outletMenuItemId", "variantId");

-- CreateIndex
CREATE INDEX "OutletAddonPrice_addonId_idx" ON "OutletAddonPrice"("addonId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletAddonPrice_outletId_addonId_key" ON "OutletAddonPrice"("outletId", "addonId");

-- CreateIndex
CREATE INDEX "MenuAvailabilityRule_outletMenuItemId_dayOfWeek_isActive_idx" ON "MenuAvailabilityRule"("outletMenuItemId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE INDEX "Cart_userId_isActive_idx" ON "Cart"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Cart_outletId_idx" ON "Cart"("outletId");

-- CreateIndex
CREATE INDEX "Cart_couponId_idx" ON "Cart"("couponId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_outletMenuItemId_idx" ON "CartItem"("outletMenuItemId");

-- CreateIndex
CREATE INDEX "CartItem_outletVariantPriceId_idx" ON "CartItem"("outletVariantPriceId");

-- CreateIndex
CREATE INDEX "CartItemAddon_outletAddonPriceId_idx" ON "CartItemAddon"("outletAddonPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItemAddon_cartItemId_outletAddonPriceId_key" ON "CartItemAddon"("cartItemId", "outletAddonPriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_startsAt_expiresAt_idx" ON "Coupon"("isActive", "startsAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CouponRedemption_orderId_key" ON "CouponRedemption"("orderId");

-- CreateIndex
CREATE INDEX "CouponRedemption_couponId_userId_idx" ON "CouponRedemption"("couponId", "userId");

-- CreateIndex
CREATE INDEX "CouponRedemption_userId_redeemedAt_idx" ON "CouponRedemption"("userId", "redeemedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_userId_placedAt_idx" ON "Order"("userId", "placedAt");

-- CreateIndex
CREATE INDEX "Order_outletId_status_placedAt_idx" ON "Order"("outletId", "status", "placedAt");

-- CreateIndex
CREATE INDEX "Order_status_promisedAt_idx" ON "Order"("status", "promisedAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItemAddon_orderItemId_idx" ON "OrderItemAddon"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionRef_key" ON "Payment"("transactionRef");

-- CreateIndex
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderCancellation_orderId_key" ON "OrderCancellation"("orderId");

-- CreateIndex
CREATE INDEX "PrepTimeEstimate_orderId_estimatedAt_idx" ON "PrepTimeEstimate"("orderId", "estimatedAt");

-- CreateIndex
CREATE INDEX "KitchenAlert_orderId_status_idx" ON "KitchenAlert"("orderId", "status");

-- CreateIndex
CREATE INDEX "KitchenAlert_status_triggeredAt_idx" ON "KitchenAlert"("status", "triggeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "KitchenAlert_orderId_type_key" ON "KitchenAlert"("orderId", "type");

-- CreateIndex
CREATE INDEX "KitchenOrderNote_orderId_createdAt_idx" ON "KitchenOrderNote"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PartyOrderRequest_requestNumber_key" ON "PartyOrderRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "PartyOrderRequest_customerId_createdAt_idx" ON "PartyOrderRequest"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "PartyOrderRequest_status_eventAt_idx" ON "PartyOrderRequest"("status", "eventAt");

-- CreateIndex
CREATE INDEX "PartyOrderRequest_outletId_eventAt_idx" ON "PartyOrderRequest"("outletId", "eventAt");

-- CreateIndex
CREATE INDEX "PartyOrderRequest_managerId_status_idx" ON "PartyOrderRequest"("managerId", "status");

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outlet" ADD CONSTRAINT "Outlet_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffOutlet" ADD CONSTRAINT "StaffOutlet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffOutlet" ADD CONSTRAINT "StaffOutlet_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuVariant" ADD CONSTRAINT "MenuVariant_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemAddon" ADD CONSTRAINT "MenuItemAddon_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemAddon" ADD CONSTRAINT "MenuItemAddon_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletMenuItem" ADD CONSTRAINT "OutletMenuItem_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletMenuItem" ADD CONSTRAINT "OutletMenuItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletVariantPrice" ADD CONSTRAINT "OutletVariantPrice_outletMenuItemId_fkey" FOREIGN KEY ("outletMenuItemId") REFERENCES "OutletMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletVariantPrice" ADD CONSTRAINT "OutletVariantPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "MenuVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletAddonPrice" ADD CONSTRAINT "OutletAddonPrice_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletAddonPrice" ADD CONSTRAINT "OutletAddonPrice_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "Addon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAvailabilityRule" ADD CONSTRAINT "MenuAvailabilityRule_outletMenuItemId_fkey" FOREIGN KEY ("outletMenuItemId") REFERENCES "OutletMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_outletMenuItemId_fkey" FOREIGN KEY ("outletMenuItemId") REFERENCES "OutletMenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_outletVariantPriceId_fkey" FOREIGN KEY ("outletVariantPriceId") REFERENCES "OutletVariantPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemAddon" ADD CONSTRAINT "CartItemAddon_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItemAddon" ADD CONSTRAINT "CartItemAddon_outletAddonPriceId_fkey" FOREIGN KEY ("outletAddonPriceId") REFERENCES "OutletAddonPrice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCancellation" ADD CONSTRAINT "OrderCancellation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCancellation" ADD CONSTRAINT "OrderCancellation_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepTimeEstimate" ADD CONSTRAINT "PrepTimeEstimate_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepTimeEstimate" ADD CONSTRAINT "PrepTimeEstimate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenAlert" ADD CONSTRAINT "KitchenAlert_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenAlert" ADD CONSTRAINT "KitchenAlert_acknowledgedByUserId_fkey" FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenOrderNote" ADD CONSTRAINT "KitchenOrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitchenOrderNote" ADD CONSTRAINT "KitchenOrderNote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyOrderRequest" ADD CONSTRAINT "PartyOrderRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyOrderRequest" ADD CONSTRAINT "PartyOrderRequest_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyOrderRequest" ADD CONSTRAINT "PartyOrderRequest_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
