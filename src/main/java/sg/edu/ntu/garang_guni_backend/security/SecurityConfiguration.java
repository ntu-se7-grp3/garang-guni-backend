package sg.edu.ntu.garang_guni_backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import sg.edu.ntu.garang_guni_backend.services.impls.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenFilter jwtTokenFilter;

    public SecurityConfiguration(CustomUserDetailsService customUserDetailsService, JwtTokenFilter jwtTokenFilter) {            
        this.customUserDetailsService = customUserDetailsService;
        this.jwtTokenFilter = jwtTokenFilter;
    }

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(HttpSecurity http, PasswordEncoder passwordEncoder) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http
                .getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder);
        return authenticationManagerBuilder.build();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/scrapdealers/**").hasAuthority("ROLE_SCRAP_DEALER") 
                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN") 
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);
    
        return http.build();
    }
}
