# Cubist Games Frontend

This is a fully featured and free frontend to interact with Solana's Cubist Games. Cubist Games is a Solana program which allows to easily create games in the Solana network. No coding skills required! Take a look at our [demo](https://cubistgames.vercel.app/).

The frontend can be classified in two parts:

- **Admin panel**: Dashboard for managing game creation, set outcomes, activate/deactivate games and collect profits.
- **Game interface**: The game interface is a Web3 APP which allows players to visit and play your games.

# Create your own gaming platform in less than 5 minutes!

To create your own gaming site just follow these steps:

## Fork Cubist Games Frontend

- Go into the Cubist Games Frontend repository: https://github.com/AnderUstarroz/cubist-games-frontend
- Click on `Fork` to copy the repository (if you don't have a Github account, you can [create one for free](https://github.com/signup))

## Vercel Setup

1. [Create a Vercel account](https://vercel.com/signup) (if you don´t have one already) using your previously created github account to login.
2. If you didn't have a Vercel account, you'll be asked to install Vercel into Github. Choose your account and skip to step 5 below in this case.
3. Go to [Vercel's Dashboard](https://vercel.com/dashboard).
4. Click on `Create New Project`.
5. Click on `Import from Git` and in the popup select `Only select repositories` and choose the previously forked: `cubist-games-frontend`.
6. Click on `Install`.
7. Enter the repository URL if asked: `https://github.com/AnderUstarroz/cubist-games-frontend`
8. Click on `Import cubist-games-frontend repository`.
9. Click on the `Environment Variables` tab and add the following variables:

   - `NEXT_PUBLIC_AUTHORITY`: Your public wallet address. Only this address will be allowed to access the admin panel.
   - `NEXT_PUBLIC_SITE_NAME`: The name of your site.
   - `NEXT_PUBLIC_LOGO` (optional): The URL of your logo (recommended size 300x300)
   - `NEXT_PUBLIC_HOME_IMAGE_URL` (optional): The URL of the main homepage image (recommended size 930 × 230)
   - `NEXT_PUBLIC_FAVICON` (optional): The URL of your customized favicon, the icon displayed within the browser tab to represent your site (recommended size 96x96)
   - `NEXT_PUBLIC_DISCORD` (optional): The URL of your Discord server
   - `NEXT_PUBLIC_TWITTER` (optional): The URL of your Twitter site
   - `NEXT_PUBLIC_WEB` (optional): The URL of your website

   ```
   Note: For editing and uploading images you can use https://www.photopea.com and https://imgur.com respectively.
   ```

10. Click on `Deploy` (wait for about 5min)
11. Your app should be up and running now, nonetheless we recommend you to change the domain for something more readable.
12. Go back to [Vercel's Dashboard](https://vercel.com/dashboard)
13. Click on your newly created project.
14. Go to `Settings` tab, then click on `Domains` and edit the default domain using something like `YOURNEWDOMAIN.vercel.app` (replace only the `YOURNEWDOMAIN` part).

## Custom Domain name

If you want to use your Custom domain instead of the current Vercel subdomain (`YOURNEWDOMAIN.vercel.app`) just follow [these steps](https://vercel.com/docs/concepts/projects/domains/add-a-domain).
