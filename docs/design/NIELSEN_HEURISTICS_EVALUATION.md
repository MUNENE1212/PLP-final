# Nielsen's 10 Usability Heuristics Evaluation - Dumuwaks Booking Platform

## Evaluation Overview

**Evaluator**: UX Specialist AI
**Date**: February 2026
**Platform**: Dumuwaks Service Booking Platform
**Scope**: Customer booking flow, Technician onboarding, Profile management

**Rating Scale**:
- 0 = Violation (Major usability problem)
- 1 = Minor Issue (Cosmetic/Minor usability problem)
- 2 = OK (Usability problem not likely)
- 3 = Good (No usability problem)

---

## Heuristic 1: Visibility of System Status

> The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.

### Evaluation

#### Loading States
| Component | Status | Rating | Notes |
|-----------|--------|--------|-------|
| ServiceDiscovery loading | Present | 2 | Skeleton loading exists |
| TechnicianSelector loading | Present | 2 | Skeleton cards shown |
| Booking submission | Present | 2 | isSubmitting state disables buttons |
| Payment processing | Present | 2 | Status tracker shows progress |

#### Status Indicators
| Component | Status | Rating | Notes |
|-----------|--------|--------|-------|
| BookingStepper | Good | 3 | Clear step indication |
| Booking status badge | Good | 3 | Color-coded with icons |
| Escrow status | Good | 3 | Clear funded/pending states |
| Availability toggle | Good | 3 | Binary but clear |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| No auto-refresh for booking status | BookingDetail.tsx | HIGH |
| No progress during API calls | Multiple | MEDIUM |
| No success animation on completion | BookingConfirmation | LOW |

#### Evidence

**Good Example** (BookingStepper.tsx):
```tsx
// Mobile progress bar
<div
  className="h-full bg-circuit transition-all duration-300 ease-out"
  style={{ width: `${(currentStep / steps.length) * 100}%` }}
  role="progressbar"
  aria-valuenow={currentStep}
  aria-valuemin={1}
  aria-valuemax={steps.length}
/>
```

**Gap Example** (BookingDetail.tsx):
```tsx
// No real-time updates - requires manual refresh
useEffect(() => {
  if (id) {
    dispatch(fetchBooking(id));
  }
}, [id, dispatch]); // Only runs on mount, not on status change
```

### Recommendations

1. **Add WebSocket/SSE for real-time updates**
   - Booking status changes
   - Payment status updates
   - Technician arrival tracking

2. **Add progress indicators for all async operations**
   ```tsx
   {isLoading && (
     <div className="flex items-center gap-2">
       <Spinner />
       <span>Finding available technicians...</span>
     </div>
   )}
   ```

3. **Add toast notifications for status changes**
   - "Your booking has been confirmed!"
   - "Technician is on the way"
   - "Payment received"

### Heuristic 1 Score: 2.2/3.0 (Good with minor improvements needed)

---

## Heuristic 2: Match Between System and Real World

> The system should speak the users' language, with words, phrases and concepts familiar to the user, rather than system-oriented terms.

### Evaluation

#### Language Assessment

| Term | User-Friendly? | Better Alternative |
|------|---------------|-------------------|
| "WORD BANK" | No | "Service Catalog" or "Our Services" |
| "Escrow Deposit" | Partially | "Secure Deposit" with explanation |
| "ServiceLocation" | Technical | "Service Address" |
| "BookingFlowState" | Technical | (Internal only - OK) |
| "En Route" | Good | "On the way" (more natural) |

#### Metaphors & Conventions

| Element | Follows Convention? | Rating |
|---------|-------------------|--------|
| Calendar icon for date | Yes | 3 |
| Map pin for location | Yes | 3 |
| Clock for time | Yes | 3 |
| Star for rating | Yes | 3 |
| Steps for booking flow | Yes | 3 |

#### Cultural Relevance (Kenyan Market)

| Element | Appropriate? | Notes |
|---------|-------------|-------|
| M-Pesa payment | Yes | Primary payment method |
| KES currency | Yes | Kenyan Shilling |
| County/City structure | Yes | Kenyan administrative divisions |
| Landmarks reference | Yes | Common way to find locations |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| "WORD BANK" term is confusing | ServiceDiscovery.tsx | MEDIUM |
| Technical error messages | Multiple | MEDIUM |
| No plain English explanations | PaymentPlan section | LOW |

#### Evidence

**Good Example** (BookingSummary.tsx):
```tsx
<p className="text-xs text-steel">
  Your deposit is held in escrow until job completion
</p>
```

**Gap Example** (Error handling):
```tsx
// Generic error message
catch (error: any) {
  toast.error(error || 'Failed to create booking');
  // Should be: "We couldn't complete your booking. Please check your network and try again."
}
```

### Recommendations

1. **Rename "WORD BANK" to "Service Catalog"**
2. **Add contextual help tooltips**
   ```tsx
   <Tooltip content="Your deposit is securely held until the job is done to your satisfaction">
     <QuestionIcon />
   </Tooltip>
   ```

3. **Rewrite error messages in plain language**
   - "Payment failed" -> "M-Pesa couldn't process your payment. Please try again or check your M-Pesa balance."

### Heuristic 2 Score: 2.4/3.0 (Good with terminology improvements needed)

---

## Heuristic 3: User Control and Freedom

> Users often choose system functions by mistake and will need a clearly marked "emergency exit" to leave the unwanted state without having to go through an extended dialogue.

### Evaluation

#### Cancel/Back Options

| Screen | Back Option | Cancel Option | Rating |
|--------|-------------|---------------|--------|
| ServiceDiscovery | Yes (back button) | No | 2 |
| TechnicianSelector | Yes (previous step) | No | 2 |
| PaymentPlan | Yes (previous step) | No | 2 |
| ScheduleDetails | Yes (previous step) | Yes (cancel at top) | 3 |
| BookingSummary | Yes (edit step) | No | 2 |
| Payment Modal | No | Yes (with confirmation) | 2 |

#### Undo Actions

| Action | Undo Available? | Rating |
|--------|----------------|--------|
| Service selection | Yes (click another) | 3 |
| Technician selection | Yes (click another) | 3 |
| Cancel booking | N/A - irreversible | 0 |
| Submit booking | No | 1 |

#### Exit Points

| Location | Easy Exit? | Notes |
|----------|------------|-------|
| Booking flow | Yes | Navigation always visible |
| Modal dialogs | Yes | Close button, backdrop click |
| Forms | Partial | Cancel button, but loses data |
| Payment | Yes | With confirmation dialog |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| No booking edit after submission | CreateBookingFlow | HIGH |
| Payment modal has confusing exit | BookingFeePaymentModal | MEDIUM |
| Form data loss on cancel | ProfileSettings | MEDIUM |
| No "save draft" option | CreateBookingFlow | MEDIUM |

#### Evidence

**Good Example** (ProfileSettings.tsx):
```tsx
const handleCancel = () => {
  if (hasChanges) {
    if (window.confirm('You have unsaved changes. Are you sure?')) {
      navigate(-1);
    }
  } else {
    navigate(-1);
  }
};
```

**Gap Example** (BookingFeePaymentModal.tsx):
```tsx
const handlePaymentClose = useCallback(() => {
  const confirm = window.confirm(
    'Payment is required to proceed. Close without paying? Your booking will remain pending.'
  );
  // Confusing: what happens to the booking? Is it cancelled? Saved?
}, []);
```

### Recommendations

1. **Add booking edit capability (within time window)**
2. **Add "Save Draft" for in-progress bookings**
3. **Improve payment modal exit messaging**
   - "Your booking is saved. You can pay later from My Bookings."
4. **Add confirmation before destructive actions**

### Heuristic 3 Score: 2.0/3.0 (Needs improvement in undo/redo)

---

## Heuristic 4: Consistency and Standards

> Users should not have to wonder whether different words, situations, or actions mean the same thing.

### Evaluation

#### Terminology Consistency

| Concept | Variations Found | Consistent? |
|---------|-----------------|-------------|
| Service provider | "Technician", "Professional" | Inconsistent |
| Booking ID | "bookingNumber", "bookingId", "Booking #" | Inconsistent |
| Payment upfront | "Escrow deposit", "booking fee", "deposit" | Inconsistent |
| Location | "serviceLocation", "address", "location" | Inconsistent |

#### Visual Consistency

| Element | Consistent? | Notes |
|---------|-------------|-------|
| Primary button style | Yes | Circuit blue, rounded |
| Card style | Yes | Charcoal background |
| Typography scale | Yes | Design tokens defined |
| Color usage | Mostly | Some inconsistencies in status colors |
| Icon usage | Yes | Lucide icons throughout |

#### Platform Conventions

| Convention | Followed? | Notes |
|------------|-----------|-------|
| Bottom navigation (mobile) | No | Uses top nav |
| Pull to refresh | No | Not implemented |
| Swipe actions | No | Not implemented |
| Back button behavior | Yes | Browser and app nav aligned |

#### Internal Consistency

| Component | Consistent? | Rating |
|-----------|-------------|--------|
| Button component | Yes | 3 |
| Input component | Yes | 3 |
| Card component | Yes | 3 |
| Modal component | Mostly | 2 |
| Loading states | Mostly | 2 |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| Multiple terms for same concept | Throughout | MEDIUM |
| Status badge colors vary | BookingDetail vs BookingCard | LOW |
| Button sizes inconsistent | Multiple | MEDIUM |

### Recommendations

1. **Create terminology glossary and enforce**
2. **Standardize status colors across all views**
3. **Consider bottom navigation for mobile**
4. **Add component style guide documentation**

### Heuristic 4 Score: 2.1/3.0 (Good but needs terminology standardization)

---

## Heuristic 5: Error Prevention

> Even better than good error messages is a careful design which prevents a problem from occurring in the first place.

### Evaluation

#### Input Validation

| Field | Validation | Preventive? | Rating |
|-------|------------|-------------|--------|
| Date | min date set | Yes | 3 |
| Time | None | No | 1 |
| Phone number | None | No | 1 |
| Email | Type="email" | Partial | 2 |
| Address | Required only | No | 1 |

#### Confirmation Dialogs

| Action | Confirmation? | Rating |
|--------|---------------|--------|
| Cancel booking | Yes | 3 |
| Close payment modal | Yes | 3 |
| Navigate away with changes | Yes | 3 |
| Delete work gallery image | No | 1 |

#### Disabled States

| Element | Disabled When? | Rating |
|---------|---------------|--------|
| Submit button | During submission | 3 |
| Past dates | Date picker | 3 |
| Next button | Validation fails | 2 |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| No phone format validation | ProfileSettings | HIGH |
| No time conflict prevention | ScheduleDetails | MEDIUM |
| No duplicate booking check | CreateBookingFlow | MEDIUM |
| No image size warning before upload | ImageUpload | LOW |

#### Evidence

**Good Example** (CreateBookingFlow.tsx):
```tsx
<Input
  type="date"
  value={bookingFlow.scheduledDate}
  min={new Date().toISOString().split('T')[0]} // Prevents past dates
/>
```

**Gap Example** (ProfileSettings.tsx):
```tsx
<Input
  type="tel"
  value={formData.phoneNumber}
  // No pattern validation for Kenyan numbers
  // Should have: pattern="[0-9]{10}" or +254 format
/>
```

### Recommendations

1. **Add input masks and validation**
   - Phone: +254 XXX XXX XXX format
   - Time: Disable past times for today

2. **Add smart defaults**
   - Default to current time + 2 hours
   - Pre-fill address from profile

3. **Add conflict detection**
   - Warn about duplicate bookings
   - Check technician availability before selection

### Heuristic 5 Score: 1.8/3.0 (Needs more preventive validation)

---

## Heuristic 6: Recognition Rather Than Recall

> Minimize the user's memory load by making objects, actions, and options visible.

### Evaluation

#### Information Visibility

| Element | Always Visible? | Rating |
|---------|-----------------|--------|
| Current step in booking | Yes | 3 |
| Selected service | Yes (in stepper context) | 2 |
| Selected technician | Partially | 2 |
| Running total | No | 1 |
| Form progress | No | 1 |

#### Recent History

| Feature | Implemented? | Rating |
|---------|--------------|--------|
| Recent services | No | 1 |
| Recent technicians | No | 1 |
| Recent locations | No | 1 |
| Booking history | Yes | 3 |

#### Autocomplete/Suggestions

| Field | Has Autocomplete? | Rating |
|-------|-------------------|--------|
| Service search | Yes (filtered list) | 3 |
| Address | No | 1 |
| Description | No | 1 |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| No "recently viewed" services | ServiceDiscovery | MEDIUM |
| No saved addresses | CreateBookingFlow | MEDIUM |
| Price not visible during flow | Multiple steps | HIGH |
| No "favorite" technicians | TechnicianSelector | LOW |

### Recommendations

1. **Add "Recently Viewed" section**
2. **Show running cost estimate in header**
3. **Add "Save This Location" feature**
4. **Show mini-summary in sticky header**

### Heuristic 6 Score: 1.9/3.0 (Memory load could be reduced)

---

## Heuristic 7: Flexibility and Efficiency of Use

> Accelerators -- unseen by the novice user -- may often speed up the interaction for the expert user.

### Evaluation

#### Shortcuts & Accelerators

| Feature | Implemented? | Rating |
|---------|--------------|--------|
| Keyboard navigation | Partial | 2 |
| Quick rebook | No | 1 |
| Saved templates | No | 1 |
| Bulk actions | No | N/A |

#### Personalization

| Feature | Implemented? | Rating |
|---------|--------------|--------|
| Saved locations | No | 1 |
| Preferred technicians | No | 1 |
| Default payment method | No | 1 |
| Notification preferences | Partial | 2 |

#### Power User Features

| Feature | Available? | Notes |
|---------|------------|-------|
| Direct booking URL | No | Would help returning users |
| Search params preserved | Partial | Some lost on navigation |
| Dashboard shortcuts | No | Manual navigation required |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| No "Book Again" quick action | BookingDetail | MEDIUM |
| No keyboard shortcuts | Throughout | LOW |
| No deep linking | N/A | MEDIUM |

### Recommendations

1. **Add "Book Again" button on completed bookings**
2. **Preserve search state in URL params**
3. **Add keyboard shortcuts (Esc to close modals, etc.)**
4. **Add "Favorite Technicians" list**

### Heuristic 7 Score: 1.6/3.0 (Lacks efficiency features for returning users)

---

## Heuristic 8: Aesthetic and Minimalist Design

> Dialogues should not contain information which is irrelevant or rarely needed.

### Evaluation

#### Visual Hierarchy

| Element | Clear Hierarchy? | Rating |
|---------|------------------|--------|
| Primary actions | Yes | 3 |
| Secondary actions | Yes | 3 |
| Information density | Good | 3 |
| Whitespace usage | Good | 3 |

#### Content Relevance

| Screen | Relevant Content? | Rating |
|--------|-------------------|--------|
| ServiceDiscovery | Yes | 3 |
| TechnicianSelector | Yes | 3 |
| BookingSummary | Good | 2 |
| BookingDetail | Information heavy | 2 |

#### Mobile Optimization

| Element | Mobile Friendly? | Rating |
|---------|------------------|--------|
| Touch targets | No (too small) | 1 |
| Scrolling | Yes | 3 |
| Content truncation | Yes | 3 |
| Progressive disclosure | Partial | 2 |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| BookingDetail has too much info | BookingDetail.tsx | MEDIUM |
| Terms text is verbose | BookingSummary.tsx | LOW |
| Touch targets too small | Multiple | HIGH |

### Recommendations

1. **Use progressive disclosure in BookingDetail**
2. **Collapse long text by default**
3. **Increase touch target sizes**
4. **Add "Show more" for details**

### Heuristic 8 Score: 2.3/3.0 (Good visual design, mobile needs work)

---

## Heuristic 9: Help Users Recognize, Diagnose, and Recover from Errors

> Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.

### Evaluation

#### Error Message Quality

| Error Type | Plain Language? | Solution Suggested? | Rating |
|------------|-----------------|---------------------|--------|
| Form validation | Partial | No | 2 |
| API errors | No | No | 1 |
| Payment failure | Partial | Partial | 2 |
| Network errors | No | No | 1 |

#### Error Presentation

| Aspect | Implemented? | Rating |
|--------|--------------|--------|
| Field-level errors | Yes | 3 |
| Form-level errors | Partial | 2 |
| Inline vs modal | Mixed | 2 |
| Color indication | Yes | 3 |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| Generic "Failed to X" errors | Multiple | HIGH |
| No recovery suggestions | Throughout | HIGH |
| Network errors not handled | API calls | MEDIUM |

#### Evidence

**Current Error Handling**:
```tsx
catch (error: any) {
  console.error('Failed to create booking:', error);
  toast.error(error || 'Failed to create booking');
}
```

**Better Error Handling**:
```tsx
catch (error: any) {
  if (error.code === 'NETWORK_ERROR') {
    toast.error('No internet connection. Please check your network and try again.');
  } else if (error.code === 'INVALID_PHONE') {
    toast.error('Phone number not recognized. Please verify and try again.');
  } else {
    toast.error('We couldn\'t complete your booking. Please try again or contact support.');
  }
}
```

### Recommendations

1. **Create error message library with plain language**
2. **Add recovery actions to error states**
3. **Implement retry buttons for network failures**
4. **Add contextual help links**

### Heuristic 9 Score: 1.7/3.0 (Error handling needs significant improvement)

---

## Heuristic 10: Help and Documentation

> Any system should be usable without documentation, but help and documentation must be provided for complex flows.

### Evaluation

#### Help Availability

| Location | Help Available? | Rating |
|----------|-----------------|--------|
| Booking flow | No | 1 |
| Payment | No | 1 |
| Profile setup | No | 1 |
| Settings | No | 1 |

#### Documentation Quality

| Document | Exists? | Quality |
|----------|---------|---------|
| FAQ | Yes (FAQ.tsx page) | Good |
| How It Works | Yes (HowItWorks.tsx) | Good |
| Terms of Service | Yes | Good |
| Onboarding guide | No | N/A |

#### Contextual Help

| Feature | Implemented? | Rating |
|---------|--------------|--------|
| Tooltips | No | 1 |
| Hint text | Partial | 2 |
| Progressive hints | No | 1 |
| Chat support | WhatsApp button | 3 |

#### Gaps Identified

| Issue | Location | Severity |
|-------|----------|----------|
| No in-flow help | CreateBookingFlow | HIGH |
| No tooltips on complex fields | ProfileSettings | MEDIUM |
| No first-time user tour | Throughout | MEDIUM |

### Recommendations

1. **Add contextual help tooltips**
2. **Add first-time user onboarding tour**
3. **Add "?" icons with expandable explanations**
4. **Add live chat option (beyond WhatsApp)**

### Heuristic 10 Score: 1.6/3.0 (Help documentation is limited)

---

## Overall Heuristic Scores Summary

| Heuristic | Score | Priority |
|-----------|-------|----------|
| 1. Visibility of System Status | 2.2/3.0 | MEDIUM |
| 2. Match Between System and Real World | 2.4/3.0 | LOW |
| 3. User Control and Freedom | 2.0/3.0 | MEDIUM |
| 4. Consistency and Standards | 2.1/3.0 | MEDIUM |
| 5. Error Prevention | 1.8/3.0 | HIGH |
| 6. Recognition Rather Than Recall | 1.9/3.0 | MEDIUM |
| 7. Flexibility and Efficiency | 1.6/3.0 | MEDIUM |
| 8. Aesthetic and Minimalist Design | 2.3/3.0 | LOW |
| 9. Help Users Recover from Errors | 1.7/3.0 | HIGH |
| 10. Help and Documentation | 1.6/3.0 | MEDIUM |

**Overall Score: 1.96/3.0 (65%)**

---

## Priority Issues by Heuristic

### Must Fix (Heuristic violations causing user pain)

1. **Error Prevention (1.8)** - Validation gaps cause failed submissions
2. **Error Recovery (1.7)** - Poor error messages leave users stuck
3. **Flexibility (1.6)** - No shortcuts for returning users
4. **Help & Documentation (1.6)** - No contextual help available

### Should Fix (Significant usability improvements)

1. **Recognition (1.9)** - Memory load on users during flow
2. **User Control (2.0)** - Limited undo/edit capabilities
3. **Consistency (2.1)** - Terminology inconsistencies

### Nice to Have (Polish items)

1. **Visibility (2.2)** - Add real-time updates
2. **Aesthetics (2.3)** - Mobile touch target sizes
3. **Real World Match (2.4)** - Terminology improvements

---

## Recommended Action Plan

### Phase 1: Error Experience (Week 1-2)
- Implement error message library
- Add validation to all inputs
- Add retry mechanisms for network failures

### Phase 2: User Assistance (Week 3-4)
- Add contextual help tooltips
- Implement first-time user tour
- Add "Book Again" quick action

### Phase 3: Efficiency Features (Week 5-6)
- Add saved locations
- Add favorite technicians
- Add keyboard shortcuts

### Phase 4: Polish (Week 7-8)
- Standardize terminology
- Add real-time status updates
- Improve mobile touch targets
