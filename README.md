# Cubist Games Frontend

Fully featured (and free) frontend for Cubist Games. Cubist Games is a Solana smart contract which
allows the creation of games in the Solana Network, allowing anybody without coding skills to easily create a gaming platform in less than 5 minutes.

The frontend can be classified in two parts:

- **Admin panel**: Dashboard for managing game creation, set outcomes, activate/deactivate games and collect profits.
- **Game interface**: The game interface is a Web3 APP which allows players to visit and play your games.

# How to create you own Gaming platform

To create your own gaming site in few minutes follow these steps:

## Fork Cubist Games Frontend

- Go into the Cubist Games Frontend repository: https://github.com/AnderUstarroz/cubist-games-frontend
- Click on `Fork` to copy the repository (if you don't have a Github account, you can [create one for free](https://github.com/signup))

## Vercel Setup

- [Create a Vercel account](https://vercel.com/signup) (if you don´t have one already) using your previously created github account to login.
- Go to [Vercel's Dashboard](https://vercel.com/dashboard).
- Click on `Create New Project`.
- Click on `Import from Git` and in the popup select `Only select repositories` and choose the previously forked: `cubist-games-frontend`.
- Click on `Install`.
- Enter the following repository URL: `https://github.com/AnderUstarroz/cubist-games-frontend`
- Click on `Import cubist-games-frontend repository`.
- Click on the `Environment Variables` tab and add the following variables:

  - `VERCEL_ENV`: `development`
  - `NEXT_PUBLIC_ENV`: development
  - `NEXT_PUBLIC_SOLANA_RPC_HOST`: https://api.devnet.solana.com
  - `NEXT_PUBLIC_SOLANA_NETWORK`: devnet
  - `NEXT_PUBLIC_AUTHORITY`: HERE_YOUR_PUBLIC_WALLETS_ADDRESS
  - `NEXT_PUBLIC_SITE_NAME`: HERE_YOUR_SITE_NAME
  - `NEXT_PUBLIC_LOGO` (optional): HERE_THE_URL_OF_YOUR_LOGO (recommended size 300x300)
  - `NEXT_PUBLIC_FAVICON` (optional): HERE_THE_URL_OF_YOUR_FAVICON (recommended size 96x96)
  - `NEXT_PUBLIC_DISCORD` (optional): HERE_YOUR_DISCORD_URL
  - `NEXT_PUBLIC_TWITTER` (optional): HERE_YOUR_TWITTER_URL
  - `NEXT_PUBLIC_WEB` (optional): HERE_YOUR_WEBSITES_URL
    ```
    Note: For uploading and editting images you can use https://imgur.com and https://www.photopea.com respectively.
    ```

- Click on `Deploy` (wait for about 2min)
- Your app should be up and running now, nonetheless we recommend you to change the domain for something more readable.
- Go back to [Vercel's Dashboard](https://vercel.com/dashboard)
- Click on your newly created project.
- Go to `Settings` tab, then click on `Domains` and edit the default domain using something like `YOURNEWDOMAIN.vercel.app` (replace only the `YOURNEWDOMAIN` part).

## Custom Domain name

If you want to use your Custom domain instead of the current Vercel subdomain (`X.vercel.ap`) just follow [these steps](https://vercel.com/docs/concepts/projects/domains/add-a-domain).
