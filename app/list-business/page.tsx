"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "localplatform-auth",
    },
  }
);

type ListingPlan = "free" | "6_month" | "1_year";

const planInfo = {
  free: {
    name: "Free",
    price: 0,
    duration: "3 Months",
  },
  "6_month": {
    name: "Standard",
    price: 49,
    duration: "6 Months",
  },
  "1_year": {
    name: "Premium",
    price: 99,
    duration: "1 Year",
  },
};

const categoryServices: Record<string, string[]> = {
  Architect: [
    "Residential Design",
    "Commercial Design",
    "3D Elevation",
    "Floor Plan",
    "Interior Design",
    "Structural Planning",
  ],
  "Interior Designer": [
    "Home Interior",
    "Office Interior",
    "Modular Kitchen",
    "Bedroom Design",
    "Living Room Design",
    "3D Interior",
  ],
  Construction: [
    "House Construction",
    "Building Construction",
    "Renovation",
    "Civil Work",
    "Contractor",
    "Turnkey Construction",
  ],
  Doctor: [
    "General Consultation",
    "Health Checkup",
    "Online Consultation",
    "Emergency Care",
    "Diagnosis",
  ],
  Dentist: [
    "Dental Checkup",
    "Root Canal",
    "Dental Cleaning",
    "Braces",
    "Dental Implant",
  ],
  Restaurant: [
    "Dine In",
    "Takeaway",
    "Home Delivery",
    "North Indian",
    "South Indian",
    "Fast Food",
  ],
  Salon: [
    "Haircut",
    "Hair Styling",
    "Facial",
    "Hair Color",
    "Bridal Makeup",
    "Beauty Services",
  ],
  Electrician: [
    "House Wiring",
    "Electrical Repair",
    "Fan Installation",
    "AC Wiring",
    "Lighting",
  ],
  Plumber: [
    "Pipe Repair",
    "Bathroom Plumbing",
    "Water Tank",
    "Leakage Repair",
    "Tap Installation",
  ],
  "Real Estate": [
    "Property Sale",
    "Property Rent",
    "Residential Property",
    "Commercial Property",
    "Plots",
  ],
  "Auto Repair": [
    "Bike Repair",
    "Car Repair",
    "Servicing",
    "Oil Change",
    "Brake Repair",
  ],
  Photographer: [
    "Wedding Photography",
    "Pre Wedding",
    "Event Photography",
    "Product Photography",
    "Video Shoot",
  ],
  Gym: [
    "Gym Training",
    "Personal Training",
    "Weight Loss",
    "Strength Training",
    "Fitness Classes",
  ],
  "Coaching Institute": [
    "School Coaching",
    "Competitive Exams",
    "Online Classes",
    "Entrance Preparation",
  ],
  Hotel: [
    "Room Booking",
    "Family Rooms",
    "AC Rooms",
    "Restaurant",
    "Conference Hall",
  ],
  Other: [
    "Professional Services",
    "Consultation",
    "Home Services",
    "Business Services",
  ],
};

const categories = Object.keys(categoryServices);

export default function ListBusinessPage() {
  const [step, setStep] = useState(1);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [services, setServices] = useState<string[]>([]);

  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // IMPORTANT:
  // ₹49 Standard is selected by default
  const [listingPlan, setListingPlan] =
    useState<ListingPlan>("6_month");

  const [utrNumber, setUtrNumber] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] =
    useState<File | null>(null);

  const [showPayment, setShowPayment] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  }

  function handleImage(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Sirf image file upload karein.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image maximum 5MB ki honi chahiye.");
      return;
    }

    setError("");
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleScreenshot(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Payment screenshot image hona chahiye.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot maximum 5MB ka hona chahiye.");
      return;
    }

    setError("");
    setPaymentScreenshot(file);
  }

  function generateDescription() {
    const selectedServices =
      services.length > 0
        ? services.join(", ")
        : "professional services";

    return `${businessName} is a local ${category.toLowerCase()} business ${
      city ? `in ${city}` : ""
    }. We provide ${selectedServices}. Contact us for more information and service details.`;
  }

  function generateKeywords() {
    return [
      businessName,
      category,
      subcategory,
      city,
      area,
      ...services,
    ].filter(Boolean);
  }

  function generateHighlights() {
    return services.slice(0, 5);
  }

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Pehle login karke business list karein."
      );
    }

    return user;
  }

  async function uploadImage(
    userId: string,
    file: File,
    folder: string
  ) {
    const extension =
      file.name.split(".").pop() || "jpg";

    const fileName =
      `${userId}/${folder}-${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("business-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("business-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function createBusiness(
    userId: string,
    paid: boolean
  ) {
    const now = new Date();

    let imageUrl: string | null = null;

    if (image) {
      imageUrl = await uploadImage(
        userId,
        image,
        "business"
      );
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      if ("geolocation" in navigator) {
        const position =
          await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: 8000,
                }
              );
            }
          );

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
    } catch {
      // Location optional
    }

    let expiresAt: string | null = null;

    if (!paid) {
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + 3);
      expiresAt = expiry.toISOString();
    }

    const automaticDescription =
      description.trim() || generateDescription();

    const { data, error: insertError } =
      await supabase
        .from("businesses")
        .insert({
          business_name: businessName.trim(),
          category,
          subcategory:
            subcategory.trim() || null,
          services,
          city: city.trim(),
          phone: phone.trim() || null,

          address: address.trim() || null,
          area: area.trim() || null,
          landmark: landmark.trim() || null,
          state: state.trim() || null,
          pincode: pincode.trim() || null,

          latitude,
          longitude,

          maps_url:
            latitude !== null &&
            longitude !== null
              ? `https://www.google.com/maps?q=${latitude},${longitude}`
              : null,

          image_url: imageUrl,

          description: automaticDescription,

          short_description:
            automaticDescription.slice(0, 160),

          seo_keywords: generateKeywords(),
          highlights: generateHighlights(),

          listing_plan: paid
            ? listingPlan
            : "free",

          // Paid listing payment verify hone tak
          // public nahi hogi.
          listing_status: paid
            ? "expired"
            : "active",

          listing_started_at:
            now.toISOString(),

          listing_expires_at:
            expiresAt,

          payment_id: null,
          payment_order_id: null,
          paid_at: null,

          owner_id: userId,
        })
        .select("id")
        .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return data.id;
  }

  async function submitFreeListing() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await getUser();

      await createBusiness(
        user.id,
        false
      );

      setSuccess(
        "🎉 Business successfully list ho gaya! Free listing 3 months ke liye active hai."
      );

      setStep(5);
    } catch (err: any) {
      setError(
        err?.message ||
          "Business list karte waqt error aa gaya."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitPaidPayment() {
    if (!utrNumber.trim()) {
      setError(
        "Payment ke baad UTR / Transaction ID dalein."
      );
      return;
    }

    if (!paymentScreenshot) {
      setError(
        "Payment ka screenshot upload karein."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await getUser();

      const businessId =
        await createBusiness(
          user.id,
          true
        );

      const screenshotUrl =
        await uploadImage(
          user.id,
          paymentScreenshot,
          "payment"
        );

      const amount =
        listingPlan === "6_month"
          ? 49
          : 99;

      const { error: paymentError } =
        await supabase
          .from("listing_payments")
          .insert({
            business_id: businessId,
            user_id: user.id,
            plan: listingPlan,
            amount,
            utr_number:
              utrNumber.trim(),
            payment_screenshot:
              screenshotUrl,
            status: "pending",
          });

      if (paymentError) {
        throw new Error(
          paymentError.message
        );
      }

      setSuccess(
        "✅ Payment details submit ho gaye. Listing verification mein hai. Payment verify hone ke baad listing active hogi."
      );

      setShowPayment(false);
      setStep(5);
    } catch (err: any) {
      setError(
        err?.message ||
          "Payment submit karte waqt error aa gaya."
      );
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (listingPlan === "free") {
      await submitFreeListing();
      return;
    }

    setShowPayment(true);
    setError("");
  }

  function nextStep() {
    setError("");

    if (step === 1) {
      if (!businessName.trim()) {
        setError("Business name dalein.");
        return;
      }

      if (!category) {
        setError("Category select karein.");
        return;
      }
    }

    if (step === 2) {
      if (!phone.trim()) {
        setError("Phone number dalein.");
        return;
      }
    }

    if (step === 4) {
      if (!city.trim()) {
        setError("City dalein.");
        return;
      }
    }

    setStep((current) =>
      Math.min(current + 1, 5)
    );
  }

  function previousStep() {
    setError("");

    setStep((current) =>
      Math.max(current - 1, 1)
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">

          <Link
            href="/"
            className="text-xs font-black text-blue-600"
          >
            ← LocalPlatform
          </Link>

          <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-4xl">
            Apna Business List Karein
          </h1>

          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
            Apne business ko LocalPlatform par
            customers ke liye discoverable banayein.
          </p>

        </div>
      </section>

      {/* PROGRESS */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">

          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">

            {[
              "Business",
              "Profile",
              "Services",
              "Location",
              "Publish",
            ].map((label, index) => {
              const number = index + 1;
              const active = step >= number;

              return (
                <div key={label}>

                  <div
                    className={`h-1 rounded-full ${
                      active
                        ? "bg-slate-950"
                        : "bg-slate-200"
                    }`}
                  />

                  <div
                    className={`mt-1.5 text-center text-[8px] font-bold sm:text-[10px] ${
                      active
                        ? "text-slate-950"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* MAIN */}

      <section className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold leading-5 text-emerald-700">
            {success}
          </div>
        )}

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

          {/* STEP 1 */}

          {step === 1 && (
            <div>

              <StepTitle
                number="01"
                title="Business Details"
                description="Apne business ki basic information dalein."
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <Field
                  label="Business Name *"
                  value={businessName}
                  onChange={setBusinessName}
                  placeholder="Jaise Sunlight Architect"
                />

                <div>
                  <label className="mb-2 block text-xs font-black">
                    Category *
                  </label>

                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(
                        e.target.value
                      );
                      setServices([]);
                    }}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-950"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <Field
                  label="Subcategory"
                  value={subcategory}
                  onChange={setSubcategory}
                  placeholder="Jaise Residential Architect"
                />

              </div>

            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <div>

              <StepTitle
                number="02"
                title="Business Profile"
                description="Customers ko aapke business ke baare mein batayein."
              />

              <div className="mt-7 space-y-5">

                <Field
                  label="Phone Number *"
                  value={phone}
                  onChange={setPhone}
                  placeholder="9876543210"
                  type="tel"
                />

                <div>
                  <label className="mb-2 block text-xs font-black">
                    Business Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    rows={6}
                    placeholder="Business ke baare mein short information..."
                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-950"
                  />

                  <p className="mt-2 text-[10px] text-slate-400">
                    Blank chhodne par automatic
                    description generate hoga.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black">
                    Business Photo
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-5 py-8 text-center">

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Business preview"
                        className="h-36 w-full max-w-xs rounded-xl object-cover"
                      />
                    ) : (
                      <>
                        <div className="text-2xl">
                          📷
                        </div>

                        <div className="mt-2 text-xs font-black">
                          Photo upload karein
                        </div>

                        <div className="mt-1 text-[10px] text-slate-400">
                          Maximum 5MB
                        </div>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImage(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                    />

                  </label>
                </div>

              </div>

            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <div>

              <StepTitle
                number="03"
                title="Services"
                description="Jo services aap provide karte hain unhe select karein."
              />

              {!category ? (
                <div className="mt-7 rounded-xl bg-slate-50 p-5 text-xs text-slate-500">
                  Pehle category select karein.
                </div>
              ) : (
                <div className="mt-7">

                  <div className="grid gap-2 sm:grid-cols-2">

                    {categoryServices[
                      category
                    ]?.map((service) => {
                      const selected =
                        services.includes(
                          service
                        );

                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() =>
                            toggleService(
                              service
                            )
                          }
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-xs font-bold ${
                            selected
                              ? "border-slate-950 bg-slate-950 text-white"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <span>
                            {service}
                          </span>

                          <span>
                            {selected
                              ? "✓"
                              : "+"}
                          </span>
                        </button>
                      );
                    })}

                  </div>

                  <div className="mt-4 text-[10px] text-slate-400">
                    {services.length} services selected
                  </div>

                </div>
              )}

            </div>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <div>

              <StepTitle
                number="04"
                title="Business Location"
                description="Customers ko aapka business locate karne mein help karein."
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">
                  <Field
                    label="Full Address"
                    value={address}
                    onChange={setAddress}
                    placeholder="House / Shop / Building address"
                  />
                </div>

                <Field
                  label="Area / Locality"
                  value={area}
                  onChange={setArea}
                  placeholder="Gomti Nagar"
                />

                <Field
                  label="Landmark"
                  value={landmark}
                  onChange={setLandmark}
                  placeholder="Near Metro Station"
                />

                <Field
                  label="City *"
                  value={city}
                  onChange={setCity}
                  placeholder="Lucknow"
                />

                <Field
                  label="State"
                  value={state}
                  onChange={setState}
                  placeholder="Uttar Pradesh"
                />

                <Field
                  label="Pincode"
                  value={pincode}
                  onChange={setPincode}
                  placeholder="226010"
                />

              </div>

              <div className="mt-5 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-700">
                📍 Location permission dene par
                map location bhi save ki ja sakti hai.
              </div>

            </div>
          )}

          {/* STEP 5 */}

          {step === 5 && (
            <div>

              <StepTitle
                number="05"
                title="Choose Your Listing Plan"
                description="₹49 Standard plan default selected hai. Free chahiye to Free select karein."
              />

              {/* PAYMENT NOTICE */}

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-center">
                <p className="text-[9px] font-black text-blue-700 sm:text-xs">
                  💳 One-Time Payment
                  <span className="mx-1.5 text-blue-300">
                    •
                  </span>
                  No Subscription
                  <span className="mx-1.5 text-blue-300">
                    •
                  </span>
                  No Auto-Renewal
                </p>
              </div>

              {/* THREE PLANS */}

              <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-4">

                <PlanCard
                  selected={
                    listingPlan === "free"
                  }
                  name="FREE"
                  price="₹0"
                  duration="3 Months"
                  badge="FREE"
                  accent="blue"
                  features={[
                    "Business Listing",
                    "Profile",
                    "Services",
                    "Location",
                    "Search",
                  ]}
                  expiryText="3 months ke baad listing expire hogi."
                  renewText="Continue karne ke liye dobara payment."
                  buttonText="Start Free"
                  onClick={() =>
                    setListingPlan("free")
                  }
                />

                <PlanCard
                  selected={
                    listingPlan === "6_month"
                  }
                  name="STANDARD"
                  price="₹49"
                  duration="6 Months"
                  badge="POPULAR"
                  accent="orange"
                  features={[
                    "Business Listing",
                    "Profile",
                    "Services",
                    "Location",
                    "Search",
                  ]}
                  expiryText="6 months ke baad listing expire hogi."
                  renewText="Continue karne ke liye ₹49 dobara pay."
                  buttonText="₹49 Pay"
                  onClick={() =>
                    setListingPlan(
                      "6_month"
                    )
                  }
                />

                <PlanCard
                  selected={
                    listingPlan === "1_year"
                  }
                  name="PREMIUM"
                  price="₹99"
                  duration="1 Year"
                  badge="BEST"
                  accent="green"
                  features={[
                    "Business Listing",
                    "Profile",
                    "Services",
                    "Location",
                    "Search",
                  ]}
                  expiryText="1 year ke baad listing expire hogi."
                  renewText="Continue karne ke liye ₹99 dobara pay."
                  buttonText="₹99 Pay"
                  onClick={() =>
                    setListingPlan(
                      "1_year"
                    )
                  }
                />

              </div>

              {/* SELECTED PLAN */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-5">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 sm:text-[10px]">
                      Selected Plan
                    </p>

                    <p className="mt-1 text-sm font-black sm:text-lg">
                      {planInfo[
                        listingPlan
                      ].name}
                    </p>

                    <p className="text-[9px] text-slate-500 sm:text-xs">
                      Valid for{" "}
                      {
                        planInfo[
                          listingPlan
                        ].duration
                      }
                    </p>
                  </div>

                  <div className="text-xl font-black sm:text-2xl">
                    ₹
                    {
                      planInfo[
                        listingPlan
                      ].price
                    }
                  </div>

                </div>

              </div>

              {/* EXPIRY NOTE */}

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">

                <p className="text-[9px] font-black leading-4 text-amber-800 sm:text-xs sm:leading-5">
                  ⚠️ Important: Plan ki validity
                  khatam hone par listing expire ho jayegi.
                  Continue karne ke liye dobara payment
                  karna hoga. Auto-renewal nahi hoga.
                </p>

              </div>

            </div>
          )}

          {/* NAVIGATION */}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">

            {step > 1 ? (
              <button
                onClick={previousStep}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                onClick={nextStep}
                className="rounded-xl bg-slate-950 px-6 py-3 text-xs font-black text-white"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={publish}
                disabled={loading}
                className="rounded-xl bg-slate-950 px-6 py-3 text-xs font-black text-white disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : listingPlan === "free"
                  ? "Publish Free Listing"
                  : `Continue with ₹${
                      planInfo[
                        listingPlan
                      ].price
                    } →`}
              </button>
            )}

          </div>

        </div>
      </section>

      {/* PAYMENT MODAL */}

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[25px] bg-white p-5 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between">

              <div>
                <div className="text-lg font-black">
                  Payment Karein
                </div>

                <p className="mt-1 text-[10px] text-slate-500">
                  {
                    planInfo[
                      listingPlan
                    ].name
                  }{" "}
                  —{" "}
                  {
                    planInfo[
                      listingPlan
                    ].duration
                  }
                </p>
              </div>

              <button
                onClick={() =>
                  setShowPayment(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold"
              >
                ×
              </button>

            </div>

            {/* AMOUNT */}

            <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-center text-white">

              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Pay Amount
              </div>

              <div className="mt-1 text-4xl font-black">
                ₹
                {
                  planInfo[
                    listingPlan
                  ].price
                }
              </div>

              <div className="mt-1 text-[10px] text-slate-400">
                One-Time Payment
              </div>

            </div>

            {/* QR */}

            <div className="mt-5 rounded-2xl border border-slate-200 p-4 text-center">

              <div className="text-xs font-black">
                QR Scan karke Payment karein
              </div>

              <img
                src="/payment/phonepe-qr.jpeg"
                alt="PhonePe UPI QR Code"
                className="mx-auto mt-4 h-56 w-56 rounded-xl object-contain"
              />

              <p className="mt-3 text-[10px] leading-4 text-slate-500">
                PhonePe, Google Pay, Paytm ya kisi
                bhi UPI app se QR scan karein.
              </p>

            </div>

            {/* UTR */}

            <div className="mt-5">

              <label className="mb-2 block text-xs font-black">
                UTR / Transaction ID *
              </label>

              <input
                value={utrNumber}
                onChange={(e) =>
                  setUtrNumber(
                    e.target.value
                  )
                }
                placeholder="Payment ke baad UTR number"
                className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
              />

            </div>

            {/* SCREENSHOT */}

            <div className="mt-5">

              <label className="mb-2 block text-xs font-black">
                Payment Screenshot *
              </label>

              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-4 py-5 text-center">

                <div>

                  <div className="text-xs font-bold">
                    {paymentScreenshot
                      ? paymentScreenshot.name
                      : "Screenshot upload karein"}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400">
                    Maximum 5MB
                  </div>

                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleScreenshot(
                      e.target.files?.[0] ||
                        null
                    )
                  }
                />

              </label>

            </div>

            {/* SUBMIT */}

            <button
              onClick={
                submitPaidPayment
              }
              disabled={loading}
              className="mt-6 h-12 w-full rounded-xl bg-slate-950 text-xs font-black text-white disabled:opacity-50"
            >
              {loading
                ? "Submitting..."
                : "Payment Submit Karein"}
            </button>

            <p className="mt-3 text-center text-[9px] leading-4 text-slate-400">
              Payment verify hone ke baad hi paid
              listing active hogi.
            </p>

          </div>
        </div>
      )}

    </main>
  );
}

/* =========================================================
   STEP TITLE
========================================================= */

function StepTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>

      <div className="text-[10px] font-black tracking-[0.15em] text-blue-600">
        STEP {number}
      </div>

      <h2 className="mt-1.5 text-xl font-black tracking-tight sm:text-2xl">
        {title}
      </h2>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-black">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-950"
      />

    </div>
  );
}

/* =========================================================
   PLAN CARD
========================================================= */

function PlanCard({
  selected,
  name,
  price,
  duration,
  badge,
  accent,
  features,
  expiryText,
  renewText,
  buttonText,
  onClick,
}: {
  selected: boolean;
  name: string;
  price: string;
  duration: string;
  badge: string;
  accent: "blue" | "orange" | "green";
  features: string[];
  expiryText: string;
  renewText: string;
  buttonText: string;
  onClick: () => void;
}) {
  const colors = {
    blue: {
      border: "border-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
      button: "bg-blue-600",
      soft: "bg-blue-100",
    },
    orange: {
      border: "border-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
      button: "bg-orange-500",
      soft: "bg-orange-100",
    },
    green: {
      border: "border-emerald-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      button: "bg-emerald-600",
      soft: "bg-emerald-100",
    },
  };

  const color = colors[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-w-0 overflow-hidden rounded-xl border-2 p-2 text-left transition-all sm:rounded-2xl sm:p-5 ${
        selected
          ? `${color.border} ${color.bg} shadow-lg`
          : "border-slate-200 bg-white"
      }`}
    >

      {/* BADGE */}

      <div className="flex items-start justify-between gap-1">

        <div
          className={`truncate text-[8px] font-black sm:text-sm ${
            selected
              ? color.text
              : "text-slate-600"
          }`}
        >
          {name}
        </div>

        <span
          className={`shrink-0 rounded-full px-1.5 py-1 text-[6px] font-black sm:px-2.5 sm:text-[9px] ${
            selected
              ? `${color.button} text-white`
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {selected ? "SELECTED" : badge}
        </span>

      </div>

      {/* PRICE */}

      <div className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:mt-4 sm:text-4xl">
        {price}
      </div>

      {/* DURATION */}

      <div
        className={`mt-0.5 text-[9px] font-black sm:text-sm ${color.text}`}
      >
        {duration}
      </div>

      <div className="mt-0.5 text-[6px] font-medium text-slate-400 sm:text-[10px]">
        Validity
      </div>

      {/* FEATURES */}

      <div className="mt-2.5 space-y-1.5 sm:mt-5 sm:space-y-2.5">

        {features.map(
          (feature) => (
            <div
              key={feature}
              className="flex min-w-0 items-start gap-1 text-[7px] font-semibold leading-3 text-slate-600 sm:gap-2 sm:text-[10px] sm:leading-4"
            >
              <span
                className={`shrink-0 font-black ${color.text}`}
              >
                ✓
              </span>

              <span className="truncate">
                {feature}
              </span>
            </div>
          )
        )}

      </div>

      {/* EXPIRY */}

      <div
        className={`mt-2.5 rounded-lg p-1.5 sm:mt-5 sm:rounded-xl sm:p-3 ${color.soft}`}
      >

        <div
          className={`text-[7px] font-black leading-3 sm:text-[10px] sm:leading-4 ${color.text}`}
        >
          ⏱ {duration}
        </div>

        <p className="mt-1 text-[6px] leading-2.5 text-slate-600 sm:text-[9px] sm:leading-3.5">
          {expiryText}
        </p>

        <p className="mt-1 text-[6px] font-bold leading-2.5 text-slate-600 sm:text-[9px] sm:leading-3.5">
          {renewText}
        </p>

      </div>

      {/* BUTTON */}

      <div
        className={`mt-2.5 rounded-lg px-1 py-2 text-center text-[7px] font-black text-white sm:mt-5 sm:rounded-xl sm:px-2 sm:py-3 sm:text-xs ${color.button}`}
      >
        {buttonText}
      </div>

      {/* PAYMENT TYPE */}

      <div className="mt-1.5 text-center text-[6px] font-medium text-slate-400 sm:mt-2 sm:text-[9px]">
        {price === "₹0"
          ? "No payment"
          : "One-time • No renewal"}
      </div>

    </button>
  );
}