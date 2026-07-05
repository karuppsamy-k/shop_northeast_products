# Firestore Migration & Admin Setup

## Running the Migration Script
1. Install dependencies for the script:
   ```bash
   npm install xlsx firebase-admin
   ```
2. Go to your Firebase Console -> Project Settings -> Service Accounts.
3. Click "Generate new private key". This will download a JSON file.
4. Rename this file to `serviceAccountKey.json` and place it in the root folder of this project (next to `package.json`).
5. Run the migration script:
   ```bash
   node scripts/migrate.cjs
   ```
6. Type `yes` to confirm when prompted. The script will clear existing products and import the 500+ products from `Book1.xlsx`.

## Granting Admin Access
By default, all new users are normal users. To grant a user access to the `/admin` dashboard:
1. Log into your Firebase Console.
2. Go to **Firestore Database** -> **users** collection.
3. Find the document of the user you want to make an admin.
4. Add a new field: 
   - Field: `role`
   - Type: `string`
   - Value: `admin`
5. Refresh the app while logged in as that user. You will now be able to access the `/admin` route.

## Security Rules
You must deploy the new Firestore Security Rules. You can do this via the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
Or manually copy the contents of `firestore.rules` into the "Rules" tab in the Firebase Console under Firestore Database.
