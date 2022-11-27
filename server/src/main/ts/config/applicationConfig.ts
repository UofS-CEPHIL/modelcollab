export interface ApplicationConfig {

}

const applicationConfig = {
    juliaPath: "/home/mc/modelcollab/server/julia-1.7.3/bin/julia",

    useHttp: false,
    httpPort: 80,

    useHttps: true,
    httpsPort: 443,
    httpsPrivKeyPath: '/etc/letsencrypt/live/modelcollab-backend.com/privkey.pem',
    httpsCertPath: '/etc/letsencrypt/live/modelcollab-backend.com/cert.pem',
    httpsChainPath: '/etc/letsencrypt/live/modelcollab-backend.com/chain.pem',
}

export default applicationConfig;
