# Cristal Quest – de proyecto web a APK con Bubblewrap

Bubblewrap NO empaqueta archivos locales: envuelve una web PWA que esté publicada por HTTPS.
Por eso hay que subir esta carpeta a un hosting gratuito primero.

## 0. Subir a GitHub y publicar con GitHub Pages
    git init && git add . && git commit -m "Cristal Quest"
    git branch -M main && git remote add origin https://github.com/USUARIO/REPO.git && git push -u origin main
En GitHub: Settings -> Pages -> Deploy from a branch -> main / (root). URL: https://USUARIO.github.io/REPO/
- `.nojekyll` (incluido) evita que GitHub Pages ignore la carpeta `.well-known`.
- Para ocultar la barra del navegador en el APK, `assetlinks.json` debe estar en la RAÍZ del dominio: usa un repositorio llamado USUARIO.github.io (o un dominio propio). En un repositorio normal (USUARIO.github.io/REPO/) la app funciona, pero puede mostrar la barra.
- `.gitignore` (incluido) evita subir claves (.keystore) y APK. NUNCA subas tu clave de firma de Bubblewrap.
- Cada cambio: `git add . && git commit -m "..." && git push`; sube la versión del service worker (ahora `cq5`; la próxima vez `cq6`) para que los celulares actualicen.

## 1. Publicar la carpeta (elige uno)
- Netlify Drop: entra a app.netlify.com/drop y arrastra la carpeta `cq`.
- GitHub Pages o Cloudflare Pages también sirven.
Anota la URL final, por ejemplo https://cristalquest.netlify.app

## 2. Generar el APK
    bubblewrap init --manifest=https://TU-URL/manifest.webmanifest
(responde las preguntas; guarda la clave de firma que crea)
    bubblewrap build
Se genera `app-release-signed.apk`: cópialo al celular e instálalo.
Para pantalla completa sin barra del navegador, sube `.well-known/assetlinks.json`
a tu hosting con tu package name y el SHA-256 que muestra:
    bubblewrap fingerprint list
(edita los dos valores REEMPLAZA en .well-known/assetlinks.json antes de subirlo).

## 3. Cuentas, ranking mundial y carrera online (Firebase, gratis)
1. console.firebase.google.com -> crear proyecto.
2. Authentication -> Sign-in method -> activar "Correo electrónico/contraseña".
3. Firestore Database -> crear base de datos (modo producción).
4. Configuración del proyecto -> General: copia el "ID del proyecto" y la "Clave de API web".
5. En `index.html` escribe: `const FB={p:'ID-DEL-PROYECTO',k:'CLAVE-API-WEB'}`
6. Firestore -> Reglas, pega:

    rules_version = '2';
    service cloud.firestore { match /databases/{db}/documents {
      match /rank/{u} { allow read: if true; allow write: if request.auth != null && request.auth.uid == u && request.resource.data.level is int && request.resource.data.level < 1000; }
      match /users/{u} { allow read: if true; allow create: if request.auth != null && request.auth.uid == u; }
      match /nicks/{n} { allow read: if true; allow create: if request.auth != null && request.resource.data.u == request.auth.uid; }
      match /{c}/{u} { allow read, write: if c.matches('rooms_.*') && request.auth != null; }
    } }

7. Vuelve a publicar la carpeta y regenera el APK (el service worker ahora es `cq2`, así se actualiza).

Notas:
- Registro con correo (Gmail u otro) o celular + contraseña, más un nickname único (3-16 caracteres) visible en el ranking y para otros jugadores.
- El celular se usa solo como identificador (internamente un correo `cel<numero>@cq-phone.app`): NO se verifica por SMS ni hay recuperación de contraseña. El correo tampoco se verifica ni tiene recuperación.
- Sin cuenta se puede jugar en solitario (modo invitado); ranking mundial y carrera online requieren cuenta.
- La carrera online consulta Firestore cada 2 s por jugador; sirve para grupos pequeños.
