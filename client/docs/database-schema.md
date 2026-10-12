# Database schema

MongoDB (Mongoose models in `src/models/`). Images and videos are not stored
in the database: they live on Cloudinary, and documents keep the delivery URL
plus the Cloudinary `publicId` (so a replaced file can be deleted).

## Entity relationships

```mermaid
erDiagram
    ADMIN ||--o{ ADMIN_SESSION : "signs in with"
    CATEGORY ||--o{ PRODUCT : "groups"
    CATEGORY ||--|{ ATTRIBUTE_DEF : "defines fields (embedded)"
    ATTRIBUTE_DEF ||..o{ PRODUCT : "validates attributes[key]"
    PRODUCT }o..o| CLOUDINARY_ASSET : "image / imagePublicId"
    CATEGORY }o..o| CLOUDINARY_ASSET : "image / imagePublicId"
    SITE_MEDIA }o..|| CLOUDINARY_ASSET : "url / publicId"
    SITE_MEDIA }o..|| SITE_MEDIA_SLOT : "key (slot list in code)"
    ADMIN ||..o{ SITE_MEDIA : "updatedBy (username)"

    ADMIN {
        ObjectId _id PK
        string username UK
        string email UK "lowercase"
        string password "bcrypt cost 12, never selected by default"
        string role "superadmin | staff"
        bool isActive
        int failedLoginAttempts "lockout counter"
        date lockUntil "locked for 15 min after 5 misses"
        string resetTokenHash "SHA-256 of emailed token"
        date resetTokenExpires "30 min, single use"
        bool totpEnabled "two-step sign-in"
        string totpSecret "AES-256-GCM encrypted"
        string totpPendingSecret "during setup"
        int totpLastStep "blocks code replay"
        date passwordChangedAt
        date lastLoginAt
        string lastLoginIp
        date createdAt
        date updatedAt
    }

    ADMIN_SESSION {
        ObjectId _id PK
        ObjectId admin FK "-> ADMIN"
        string tokenHash UK "SHA-256 of cookie token"
        bool pendingMfa "password ok, code still due"
        int mfaAttempts
        date expiresAt "TTL index: Mongo deletes expired"
        date lastSeenAt "idle timeout 12 h"
        string ip
        string userAgent
        date createdAt
    }

    CATEGORY {
        ObjectId _id PK
        string name "Ice Cream, Kulfi, Kulfusion..."
        string slug UK "URL: /products/(slug)"
        string description
        string image "Cloudinary URL"
        string imagePublicId
        ATTRIBUTE_DEF[] attributes "the category-wise schema"
        string seoTitle
        string seoDescription
        bool isActive "hidden category hides its products"
        int sortOrder
    }

    ATTRIBUTE_DEF {
        string key "e.g. flavour, fatPercent"
        string label "e.g. Flavour, Fat %"
        string type "text | number | select | multiselect | boolean"
        string[] options "for select / multiselect"
        string unit "for number, e.g. g, %"
        bool required
        bool showOnCard
    }

    PRODUCT {
        ObjectId _id PK
        string name "unique with brand"
        ObjectId category FK "-> CATEGORY"
        string brand "slug: baeleys, topkulfi, blissberry..."
        string line "e.g. Big Cup, Family Pack"
        string format "filter: Cones, Cups, Bars, Kulfi..."
        string volume "e.g. 100 ml"
        number mrp "NPR, null = MRP on request"
        string image "Cloudinary URL"
        string imagePublicId
        int imageWidth
        int imageHeight
        string description
        object attributes "values keyed by ATTRIBUTE_DEF.key"
        bool featured "homepage favourites"
        bool isActive
        int sortOrder
    }

    SITE_MEDIA {
        ObjectId _id PK
        string key UK "slot, e.g. hero.video, logo.bluemont"
        string url "Cloudinary URL"
        string publicId
        string resourceType "image | video"
        int width
        int height
        string updatedBy "admin username or seed/script"
    }

    SITE_MEDIA_SLOT {
        string key "defined in src/lib/siteMediaSlots.js"
        string group "Logos, Hero, Homepage, Monsters..."
        string fallback "built-in file used until uploaded"
    }

    CLOUDINARY_ASSET {
        string publicId "bluemont/products|categories|site/..."
        string resourceType "image | video"
    }

    LEAD {
        ObjectId _id PK
        string businessName
        string contactPerson
        string mobileNumber
        string location
        string businessType "enum, lib/leadOptions.js"
        string[] partnershipNeed "enum list"
        string dailyFootfall
        string status "new | contacted | converted | rejected"
        string notes
    }

    CONTACT {
        ObjectId _id PK
        string name
        string email
        string phone
        string message
        bool isRead
    }
```

`LEAD` (partner applications) and `CONTACT` (contact form messages) stand
alone: they aren't linked to other collections. `SITE_MEDIA_SLOT` and
`CLOUDINARY_ASSET` are not collections. Slots are a list in code, and assets
live on Cloudinary. They are drawn here to show what the stored keys and URLs
point to.

## How the category-wise schema works

```mermaid
flowchart LR
    A["Admin → Categories<br/>Kulfi: fields Flavour (text),<br/>Base (Khuwa / Fruit / Chocolate coated)"] -->|saved as| C[("CATEGORY.attributes")]
    C -->|builds the form| E["Admin → Products<br/>“Kulfi details” inputs"]
    E -->|validateAttributeValues| P[("PRODUCT.attributes<br/>flavour: Titaura, base: Fruit")]
    P --> W["/products/kulfi page<br/>card: Flavour: Titaura"]
    P --> J["JSON-LD Product.additionalProperty<br/>for Google / AI search"]
```

Validation lives in `src/lib/categorySchema.js`:

- `validateAttributeDefs()` checks a category's field list.
- `validateAttributeValues()` checks a product's values against it: types,
  required fields and allowed options. Unknown keys are dropped.

A field's `key` never changes after it is created, so renaming a field's
label keeps the values products already have.

## Legacy

`media` (model `src/models/Media.js`, route `/media/[id]`) held admin uploads
before the move to Cloudinary. `npm run migrate` copies any images still
there to Cloudinary. After that, the collection, the model and the route can
be deleted.
