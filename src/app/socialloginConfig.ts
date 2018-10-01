import { SocialLoginModule,AuthServiceConfig,GoogleLoginProvider }
 from "angular5-social-login";

export function getAuthServiceConfigs() {
    let config = new AuthServiceConfig([{
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider("157739783989-sd8otomg3853ctapep29ka16h5aegkdu")
    }]);
    
    return config;
}