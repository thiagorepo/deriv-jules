# UXL: UX Flows Specification

> **Spec ID:** UXL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

This specification defines all user experience flows for the Deriv Jules platform, including navigation paths, state transitions, and user interactions.

---

## 2. Authentication Flows

### 2.1 Login Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ Landing │───►│  Login  │───►│ Validate│───►│ Success │      │
│  │  Page   │    │  Form   │    │Credentials   │Redirect │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                       │              │                          │
│                       │              ▼                          │
│                       │        ┌─────────┐                     │
│                       │        │  Error  │                     │
│                       │        │ Message │                     │
│                       │        └─────────┘                     │
│                       │                                          │
│                       ▼                                          │
│                 ┌─────────┐                                     │
│                 │Register │                                     │
│                 │  Link   │                                     │
│                 └─────────┘                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**States:**
- `idle` - Initial form state
- `submitting` - Form submitted, awaiting response
- `success` - Login successful
- `error` - Login failed with error message

### 2.2 Registration Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Register│───►│  Fill   │───►│ Validate│───►│ Confirm │
│  Link   │    │  Form   │    │Password │    │  Email  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                    │              │
                                    ▼              ▼
                              ┌─────────┐    ┌─────────┐
                              │Password │    │  Login  │
                              │ Strength│    │  Page   │
                              └─────────┘    └─────────┘
```

### 2.3 Password Reset Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Forgot   │───►│  Enter  │───►│  Send   │───►│  Check  │
│Password │    │  Email  │    │  Email  │    │  Inbox  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                   │
                                                   ▼
                                            ┌─────────┐
                                            │  Reset  │
                                            │Password │
                                            └─────────┘
```

---

## 3. Trading Flows

### 3.1 Market Selection Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    MARKET SELECTION FLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │Dashboard│───►│ Markets │───►│  Filter │───►│ Select  │      │
│  │  Home   │    │  List   │    │Category │    │ Market  │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                      │              │            │
│                                      ▼              ▼            │
│                                ┌─────────┐    ┌─────────┐      │
│                                │Category │    │ Price   │      │
│                                │  Tabs   │    │  Chart  │      │
│                                └─────────┘    └─────────┘      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Categories:**
- Forex
- Commodities
- Indices
- Synthetic
- Stocks

### 3.2 Trade Execution Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    TRADE EXECUTION FLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ Configure│──►│ Preview │───►│ Confirm │───►│Execute  │      │
│  │  Trade  │    │ Summary │    │ Dialog  │    │ Trade   │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       │                                             │            │
│       ▼                                             ▼            │
│  ┌─────────┐                                   ┌─────────┐      │
│  │Validate │                                   │Position │      │
│  │  Input  │                                   │ Created │      │
│  └─────────┘                                   └─────────┘      │
│                                                      │            │
│                                                      ▼            │
│                                               ┌─────────┐        │
│                                               │ Monitor │        │
│                                               │Position │        │
│                                               └─────────┘        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Trade Parameters:**
- Symbol (required)
- Contract Type (CALL/PUT/etc.)
- Stake Amount (min: 1, max: 10,000)
- Duration + Unit (s/m/h/d)

### 3.3 Position Management Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  View   │───►│ Monitor │───►│  Sell   │───►│ Confirm │
│Positions│    │  P/L    │    │Position │    │  Sell   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │                              │
     ▼              ▼                              ▼
┌─────────┐   ┌─────────┐                    ┌─────────┐
│ Filter  │   │Real-time│                    │Position │
│ Status  │   │ Updates │                    │ Closed  │
└─────────┘   └─────────┘                    └─────────┘
```

---

## 4. Admin Flows

### 4.1 User Management Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER MANAGEMENT FLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ Admin   │───►│  Users  │───►│ Search/ │───►│  View   │      │
│  │Dashboard│    │  List   │    │ Filter  │    │  User   │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                      │              │            │
│                                      ▼              ▼            │
│                                ┌─────────┐    ┌─────────┐      │
│                                │ Bulk    │    │ Edit    │      │
│                                │ Actions │    │ User    │      │
│                                └─────────┘    └─────────┘      │
│                                     │               │           │
│                                     ▼               ▼           │
│                               ┌─────────┐    ┌─────────┐       │
│                               │Suspend/ │    │  Save   │       │
│                               │ Activate│    │ Changes │       │
│                               └─────────┘    └─────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Product Management Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Products │───►│  Add    │───►│  Fill   │───►│  Save   │
│  List   │    │ Product │    │  Form   │    │ Product │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │                                             │
     ▼                                             ▼
┌─────────┐                                   ┌─────────┐
│  Edit   │                                   │Success  │
│ Product │                                   │ Toast   │
└─────────┘                                   └─────────┘
```

### 4.3 Plan Management Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Plans  │───►│  Add    │───►│Configure│───►│ Activate│
│  List   │    │  Plan   │    │ Features│    │  Plan   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 5. Navigation Flows

### 5.1 Sidebar Navigation

```
┌────────────────────────────────────────────────────────────────┐
│                      SIDEBAR                                   │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                                              │
│  │ Dashboard   │ ──► Overview, Stats, Quick Actions           │
│  └─────────────┘                                              │
│  ┌─────────────┐                                              │
│  │ Trading     │ ──► Markets, Positions, History              │
│  └─────────────┘                                              │
│  ┌─────────────┐                                              │
│  │ Account     │ ──► Profile, Settings, Security              │
│  └─────────────┘                                              │
│  ┌─────────────┐                                              │
│  │ Marketplace │ ──► Plans, Purchase, Subscriptions           │
│  └─────────────┘                                              │
│                                                                │
│  [Admin Only]                                                  │
│  ┌─────────────┐                                              │
│  │ Admin       │ ──► Users, Products, Plans, Settings         │
│  └─────────────┘                                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Breadcrumb Patterns

```
Home > Trading > Positions > [Position ID]
Home > Admin > Users > [User Email]
Home > Account > Settings
```

---

## 6. Error & Recovery Flows

### 6.1 API Error Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  API    │───►│  Show   │───►│  Retry  │───►│ Success │
│  Error  │    │  Error  │    │ Action  │    │  or     │
│         │    │  Toast  │    │ Button  │    │  Fail   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                    │              │
                                    ▼              ▼
                               ┌─────────┐    ┌─────────┐
                               │Exponential  │Contact  │
                               │Backoff  │    │Support  │
                               └─────────┘    └─────────┘
```

### 6.2 WebSocket Disconnect Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                  WEBSOCKET DISCONNECT FLOW                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ WS      │───►│  Show   │───►│Auto     │───►│Resume   │      │
│  │ Disconnect   │ Warning │    │Reconnect│    │ Normal  │      │
│  └─────────┘    │ Banner  │    │(3 tries)│    │  Ops    │      │
│                 └─────────┘    └─────────┘    └─────────┘      │
│                                      │                          │
│                                      ▼                          │
│                                ┌─────────┐                     │
│                                │ Manual  │                     │
│                                │Reconnect│                     │
│                                │ Button  │                     │
│                                └─────────┘                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Real-time Update Flows

### 7.1 Price Update Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Deriv   │───►│  Parse  │───►│ Update  │───►│Animate  │
│  Tick   │    │  Data   │    │   UI    │    │ Change  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │
     ▼
┌─────────────────┐
│ Subscribe to    │
│ Symbol Ticks    │
└─────────────────┘
```

### 7.2 Position Update Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Position │───►│Calculate│───►│ Update  │───►│Notify   │
│  Event  │    │   P/L   │    │  State  │    │  User   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 8. Onboarding Flow

### 8.1 First-Time User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ Welcome │───►│Features │───►│ Connect │───►│ Tutorial│      │
│  │  Modal  │    │Overview │    │Deriv API│    │  Tips   │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                      │              │            │
│                                      ▼              ▼            │
│                                ┌─────────┐    ┌─────────┐      │
│                                │Enter API│    │Dashboard│      │
│                                │  Token  │    │  Tour   │      │
│                                └─────────┘    └─────────┘      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Form Flow Patterns

### 9.1 Multi-Step Form Flow

```
Step 1 ──► Step 2 ──► Step 3 ──► Review ──► Submit ──► Success
  │          │          │          │          │           │
  ▼          ▼          ▼          ▼          ▼           ▼
Validate   Validate   Validate   Confirm    Process    Complete
```

### 9.2 Form State Transitions

```typescript
type FormState =
  | { status: 'idle' }
  | { status: 'editing'; dirty: boolean }
  | { status: 'validating'; errors: Record<string, string> }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };
```

---

## 10. Session Management Flows

### 10.1 Session Expiry Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Session  │───►│  Show   │───►│Re-login │───►│Resume   │
│ Expired │    │  Modal  │    │  Form   │    │Session  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### 10.2 Logout Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Logout   │───►│ Confirm │───►│ Clear   │───►│Redirect │
│ Click   │    │ Dialog  │    │Session  │    │  Home   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 11. Search & Filter Flows

### 11.1 Search Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Type   │───►│Debounce │───►│ Search  │───►│Display  │
│  Query  │    │ (300ms) │    │   API   │    │ Results │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### 11.2 Filter Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Select  │───►│ Apply   │───►│ Filter  │───►│ Update  │
│ Filter  │    │ Filter  │    │   Data  │    │   UI    │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 12. Modal & Dialog Flows

### 12.1 Confirmation Dialog Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Trigger │───►│  Show   │───►│Confirm/ │
│ Action  │    │ Dialog  │    │ Cancel  │
└─────────┘    └─────────┘    └─────────┘
```

### 12.2 Modal State Management

```typescript
type ModalState =
  | { open: false }
  | { open: true; step: 'initial' }
  | { open: true; step: 'loading' }
  | { open: true; step: 'success' }
  | { open: true; step: 'error'; message: string };
```

---

*End of UX Flows Specification*
