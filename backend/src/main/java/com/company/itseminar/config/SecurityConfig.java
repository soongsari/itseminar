package com.company.itseminar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
            .authorizeHttpRequests(authz -> authz
                // 인증 관련 엔드포인트
                .requestMatchers("/api/auth/**").permitAll()
                // Swagger 관련
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // 세미나 조회는 인증된 사용자만
                .requestMatchers(HttpMethod.GET, "/api/seminars/**").authenticated()
                // 세미나 CUD는 ADMIN만
                .requestMatchers(HttpMethod.POST, "/api/seminars").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/seminars/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/seminars/**").hasRole("ADMIN")
                // 신청자 목록 조회는 ADMIN만
                .requestMatchers("/api/seminars/*/applicants").hasRole("ADMIN")
                // 파일 업로드는 ADMIN만
                .requestMatchers(HttpMethod.POST, "/api/seminars/*/attachments").hasRole("ADMIN")
                // 신청 관련은 인증된 사용자
                .requestMatchers("/api/applications/**").authenticated()
                // 사용자 정보는 인증된 사용자
                .requestMatchers("/api/users/**").authenticated()
                // 파일 다운로드는 인증된 사용자
                .requestMatchers("/api/attachments/*/download").authenticated()
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable())
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .permitAll()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 