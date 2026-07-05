# TanStack Start Frontend Architecture Guide

# DO NOT PUT MULTIPLE COMPONENT  IN ONE FILE NEVER

> A scalable frontend architecture for medium to large TanStack Start applications.

>

> **Ignored in this guide**

>

> - API layer (already implemented)

> - TanStack Query setup (already implemented)

> - Tailwind configuration (already configured)

> - UI library (already configured)



---



# Philosophy



The project should follow these principles:



- Feature-first architecture

- Shared reusable code

- Thin route files

- Business logic inside features

- No deeply nested relative imports

- Strict separation of concerns

- Easy to scale to hundreds of pages



---



# Folder Structure



```text

src/



├── app/

│

│   ├── providers/

│   │   ├── auth-provider.tsx

│   │   ├── theme-provider.tsx

│   │   ├── websocket-provider.tsx

│   │   └── index.ts

│   │

│   ├── layouts/

│   │   ├── dashboard-layout.tsx

│   │   ├── auth-layout.tsx

│   │   └── public-layout.tsx

│   │

│   ├── config/

│   │   ├── env.ts

│   │   ├── constants.ts

│   │   ├── routes.ts

│   │   └── index.ts

│   │

│   └── middleware/

│       ├── auth.ts

│       ├── admin.ts

│       └── instructor.ts

│

│

├── routes/

│

│   ├── __root.tsx

│   ├── index.tsx

│   ├── login.tsx

│   ├── dashboard/

│   ├── admin/

│   ├── instructor/

│   └── settings/

│

│

├── features/

│

│   ├── auth/

│   ├── profile/

│   ├── booking/

│   ├── instructor/

│   ├── sessions/

│   ├── payments/

│   ├── dashboard/

│   ├── notifications/

│   └── chat/

│

│

├── shared/

│

│   ├── components/

│   │

│   │   ├── forms/

│   │   ├── layouts/

│   │   ├── navigation/

│   │   ├── tables/

│   │   ├── charts/

│   │   ├── feedback/

│   │   ├── loaders/

│   │   ├── skeletons/

│   │   ├── empty-state/

│   │   └── misc/

│   │

│   ├── hooks/

│   ├── utils/

│   ├── lib/

│   ├── types/

│   ├── schemas/

│   └── constants/

│

│

├── assets/

│

│   ├── images/

│   ├── icons/

│   └── fonts/

│

│

├── styles/

│

│   ├── globals.css

│   ├── variables.css

│   ├── animations.css

│   └── typography.css

│

│

├── server/

│

├── router.tsx

├── main.tsx

├── routeTree.gen.ts

└── index.css

```



---



# Feature Structure



Every feature should be completely isolated.



Example:



```text

features/



booking/



    components/



        booking-card.tsx



        booking-calendar.tsx



        booking-status.tsx



    hooks/



        use-bookings.ts



        use-booking-filter.ts



    services/



        booking.service.ts



    store/



        booking.store.ts



    types/



        booking.ts



    schemas/



        booking.schema.ts



    utils/



        booking-utils.ts



    index.ts

```



Everything related to booking stays inside the booking feature.



---



# Shared Folder



The shared folder contains code that can be used anywhere.



```text

shared/



    components/



    hooks/



    lib/



    utils/



    types/



    schemas/



    constants/

```



If something is only used by one feature, it should NOT be placed in shared.



---



# Route Files



Route files should contain almost no business logic.



Good:



```tsx

export const Route = createFileRoute("/dashboard")({

    component: DashboardPage,

})

```



Avoid:



- API calls

- Complex state management

- Form logic

- Validation

- Large components



Move all of those into the appropriate feature.



---



# Components



Split components into three categories.



## 1. Shared Components



Reusable across the application.



Examples:



```

PageHeader



SearchBar



Pagination



Modal



Drawer



ErrorState



EmptyState



LoadingState



Breadcrumb



ConfirmDialog

```



---



## 2. Feature Components



Used only inside one feature.



Example:



```

BookingCard



BookingCalendar



SessionTimeline



InstructorAvailability



PaymentSummary

```



---



## 3. Route Components



Very small page composition components.



Example:



```tsx

function DashboardPage() {

    return (

        <>

            <DashboardStats />

            <UpcomingSessions />

            <RevenueChart />

        </>

    )

}

```



---



# Hooks



Shared hooks belong in:



```

shared/hooks

```



Examples:



```

useDebounce



useLocalStorage



useClipboard



useMediaQuery



useDisclosure



usePrevious

```



Feature-specific hooks stay inside the feature.



Example:



```

features/



booking/hooks/



useBookings



useCreateBooking



useBookingFilter

```



---



# Types



Global reusable types:



```

shared/types

```



Feature-specific types:



```

features/booking/types

```



Never create one massive `types.ts`.



---



# Schemas



Validation should stay close to the feature.



Example:



```

booking/



    schemas/



        booking.schema.ts

```



Only reusable schemas belong inside shared.



---



# Stores



Client state should live with the feature.



Example:



```

booking/



    store/



        booking.store.ts

```



Avoid giant global stores.



Split stores by domain.



Good:



```

auth.store.ts



booking.store.ts



chat.store.ts



theme.store.ts

```



---



# Services



Complex business logic belongs inside services.



Example:



```

booking.service.ts



session.service.ts



payment.service.ts

```



Services should not render UI.



---



# Utilities



Feature utilities:



```

booking/utils/

```



Global utilities:



```

shared/utils/

```



Examples:



```

formatCurrency



formatDate



slugify



copyToClipboard



sleep



downloadFile

```



---



# Constants



Global constants:



```

shared/constants/

```



Feature constants:



```

booking/constants.ts

```



Avoid magic strings throughout the application.



---



# Barrel Exports



Every folder should export from an `index.ts`.



Example:



```

booking/



    components/



        booking-card.tsx



        booking-calendar.tsx



        index.ts

```



```ts

export * from "./booking-card"

export * from "./booking-calendar"

```



Now imports become:



```ts

import { BookingCard } from "@/features/booking"

```



instead of



```ts

../../../components/booking-card

```



---



# Naming Convention



Components



```

booking-card.tsx



user-avatar.tsx



payment-summary.tsx

```



Hooks



```

use-bookings.ts



use-profile.ts

```



Stores



```

booking.store.ts



chat.store.ts

```



Services



```

booking.service.ts

```



Schemas



```

booking.schema.ts

```



Utilities



```

booking-utils.ts

```



Types



```

booking.ts

```



---



# Absolute Imports



Always use aliases.



Good



```ts

import { BookingCard } from "@/features/booking"

```



Bad



```ts

import BookingCard from "../../../../booking/components/booking-card"

```



---



# Code Organization Rules



A feature owns:



- Components

- Hooks

- Store

- Types

- Schemas

- Services

- Utilities

- Constants



Shared owns:



- Reusable components

- Global hooks

- Global utilities

- Shared types

- Shared constants

- Shared schemas



Routes own:



- Page composition only



---



# Dependency Direction



Always follow this direction:



```

shared

      ↓

features

      ↓

routes

```



Never import one feature directly into another unless there is a strong architectural reason. If multiple features need the same functionality, move it into `shared`.



---



# File Size Guidelines



Component



- 50–200 lines



Hook



- Under 150 lines



Service



- Under 300 lines



Route



- Under 100 lines



If a file exceeds these limits, consider splitting it.



---



# Folder Rules



A folder should never contain random files.



Bad



```

booking/



    helper.ts



    temp.ts



    new.ts



    test.ts

```



Good



```

booking/



    components/



    hooks/



    store/



    utils/



    services/



    schemas/



    types/

```



---



# Avoid



❌ Giant `components` folder



❌ Giant `hooks` folder



❌ Business logic inside routes



❌ Massive global store



❌ Relative imports



❌ Duplicated utilities



❌ Duplicated validation



❌ Circular imports



❌ Components doing API work



❌ Route files over 200 lines



---



# Recommended Workflow



1. Create the route.

2. Create the feature if it doesn't exist.

3. Add components inside the feature.

4. Add hooks inside the feature.

5. Add services if business logic grows.

6. Extract reusable pieces into `shared` only when used by multiple features.

7. Keep routes focused on composition.



---



# Architecture Summary



```

Routes

│

├── Compose the page

│

▼

Features

│

├── Business logic

├── Components

├── Hooks

├── Store

├── Services

├── Schemas

└── Types

│

▼

Shared

│

├── Reusable Components

├── Utilities

├── Hooks

├── Types

├── Constants

└── Common Logic

```



This structure keeps features self-contained, minimizes coupling between modules, and allows the codebase to grow without accumulating large, hard-to-maintain folders.