# ☕ Java/Spring - Código Detalhado + JWT

**Continuação técnica do guia anterior**  
**Para completar em 24 horas**

---

## 🔐 Implementar JWT Properly

### Arquivo: `src/main/java/com/leidycleaner/security/JwtTokenProvider.java`

```java
package com.leidycleaner.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {
    
    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}") // 24 horas por padrão
    private int jwtExpirationInMs;
    
    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    public String generateAccessToken(Long userId) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
            .signWith(key(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public String [REDACTED_TOKEN](Long userId) {
        return Jwts.builder()
            .subject(String.valueOf(userId))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000)) // 7 dias
            .signWith(key(), SignatureAlgorithm.HS512)
            .compact();
    }
    
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(key())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return Long.parseLong(claims.getSubject());
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

### Arquivo: `src/main/java/com/leidycleaner/security/[REDACTED_TOKEN].java`

```java
package com.leidycleaner.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.[REDACTED_TOKEN];
import org.springframework.security.core.context.[REDACTED_TOKEN];
import org.springframework.stereotype.Component;
import org.springframework.web.filter.[REDACTED_TOKEN];

import java.io.IOException;

@Component
public class [REDACTED_TOKEN] extends [REDACTED_TOKEN] {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        String token = [REDACTED_TOKEN](request);
        
        if (token != null && tokenProvider.validateToken(token)) {
            Long userId = tokenProvider.getUserIdFromToken(token);
            
            [REDACTED_TOKEN] auth =
                new [REDACTED_TOKEN](userId, null);
            
            [REDACTED_TOKEN].getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String [REDACTED_TOKEN](HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

### Arquivo: `src/main/java/com/leidycleaner/config/SecurityConfig.java`

```java
package com.leidycleaner.config;

import com.leidycleaner.security.[REDACTED_TOKEN];
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.[REDACTED_TOKEN];
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.[REDACTED_TOKEN];
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.[REDACTED_TOKEN];
import org.springframework.web.cors.[REDACTED_TOKEN];
import org.springframework.security.config.http.[REDACTED_TOKEN];
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import java.util.Arrays;

@Configuration
public class SecurityConfig {
    
    @Autowired
    private [REDACTED_TOKEN] [REDACTED_TOKEN];
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new [REDACTED_TOKEN](12);
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.[REDACTED_TOKEN]([REDACTED_TOKEN].STATELESS))
            .[REDACTED_TOKEN](auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .cors(cors -> cors.configurationSource([REDACTED_TOKEN]()))
            .addFilterBefore([REDACTED_TOKEN], [REDACTED_TOKEN].class);
        
        return http.build();
    }
    
    @Bean
    public [REDACTED_TOKEN] [REDACTED_TOKEN]() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        [REDACTED_TOKEN] source = new [REDACTED_TOKEN]();
        source.[REDACTED_TOKEN]("/**", configuration);
        return source;
    }
}
```

---

## 📦 DTOs Completos

### `src/main/java/com/leidycleaner/dto/UserDTO.java`

```java
package com.leidycleaner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String role;
}
```

### `src/main/java/com/leidycleaner/dto/BookingDTO.java`

```java
package com.leidycleaner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private Long clientId;
    private Long serviceId;
    private String status;
    private String scheduledDate;
    private String scheduledTime;
    private Double totalPrice;
    private String notes;
    private String createdAt;
    private String updatedAt;
}
```

### `src/main/java/com/leidycleaner/dto/ServiceDTO.java`

```java
package com.leidycleaner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String duration;
    private Double basePrice;
    private Boolean isActive;
}
```

---

## 🔧 Services Completos

### `src/main/java/com/leidycleaner/service/UserService.java`

```java
package com.leidycleaner.service;

import com.leidycleaner.entity.User;
import com.leidycleaner.dto.UserDTO;
import com.leidycleaner.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }
    
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public UserDTO createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }
    
    public UserDTO updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getAddress() != null) {
            user.setAddress(userDetails.getAddress());
        }
        
        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }
    
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .role(user.getRole())
            .build();
    }
}
```

### `src/main/java/com/leidycleaner/service/BookingService.java`

```java
package com.leidycleaner.service;

import com.leidycleaner.entity.Booking;
import com.leidycleaner.dto.BookingDTO;
import com.leidycleaner.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    public BookingDTO createBooking(Booking booking) {
        booking.setCreatedAt(LocalDateTime.now().toString());
        booking.setUpdatedAt(LocalDateTime.now().toString());
        Booking saved = bookingRepository.save(booking);
        return mapToDTO(saved);
    }
    
    public BookingDTO updateBooking(Long id, Booking bookingDetails) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (bookingDetails.getStatus() != null) {
            booking.setStatus(bookingDetails.getStatus());
        }
        if (bookingDetails.getNotes() != null) {
            booking.setNotes(bookingDetails.getNotes());
        }
        if (bookingDetails.getTotalPrice() != null) {
            booking.setTotalPrice(bookingDetails.getTotalPrice());
        }
        
        booking.setUpdatedAt(LocalDateTime.now().toString());
        Booking updated = bookingRepository.save(booking);
        return mapToDTO(updated);
    }
    
    public BookingDTO getBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToDTO(booking);
    }
    
    public List<BookingDTO> getUserBookings(Long userId) {
        return bookingRepository.findByClientId(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<BookingDTO> getBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
            .id(booking.getId())
            .clientId(booking.getClient().getId())
            .serviceId(booking.getService().getId())
            .status(booking.getStatus())
            .scheduledDate(booking.getScheduledDate())
            .scheduledTime(booking.getScheduledTime())
            .totalPrice(booking.getTotalPrice())
            .notes(booking.getNotes())
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt())
            .build();
    }
}
```

---

## 🎯 Application Entrypoint

### `src/main/java/com/leidycleaner/[REDACTED_TOKEN].java`

```java
package com.leidycleaner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.[REDACTED_TOKEN];
import org.springframework.context.annotation.ComponentScan;

@[REDACTED_TOKEN]
@ComponentScan(basePackages = "com.leidycleaner")
public class [REDACTED_TOKEN] {

    public static void main(String[] args) {
        SpringApplication.run([REDACTED_TOKEN].class, args);
    }
}
```

---

## 📝 Testes Unitários (Opcional mas recomendado)

### `src/test/java/com/leidycleaner/service/AuthServiceTest.java`

```java
package com.leidycleaner.service;

import com.leidycleaner.entity.User;
import com.leidycleaner.dto.LoginRequest;
import com.leidycleaner.dto.LoginResponse;
import com.leidycleaner.repository.UserRepository;
import com.leidycleaner.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AuthServiceTest {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();
    }
    
    @Test
    public void testLogin_Success() {
        // Arrange
        User user = User.builder()
            .email("test@example.com")
            .password(passwordEncoder.encode("password123"))
            .firstName("John")
            .lastName("Doe")
            .role("ADMIN")
            .build();
        userRepository.save(user);
        
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        
        // Act
        LoginResponse response = authService.login(request);
        
        // Assert
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("test@example.com", response.getUser().getEmail());
    }
    
    @Test
    public void [REDACTED_TOKEN]() {
        // Arrange
        User user = User.builder()
            .email("test@example.com")
            .password(passwordEncoder.encode("correctPassword"))
            .firstName("John")
            .lastName("Doe")
            .role("ADMIN")
            .build();
        userRepository.save(user);
        
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongPassword");
        
        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.login(request));
    }
}
```

---

## 🚀 Como Rodar Tudo

### Passo 1: Instalar dependências
```bash
mvn clean install
```

### Passo 2: Copiar banco de dados
```bash
cp /teu/caminho/database.sqlite ./leidycleaner.sqlite
```

### Passo 3: Rodar em desenvolvimento
```bash
mvn spring-boot:run
```

### Passo 4: Testar com CURL/Postman
```bash
# Terminal 1: verificar que está rodando
curl http://localhost:8080/api/health

# Terminal 2: fazer login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@leidycleaner.com.br",
    "password":"AdminPassword123!@#"
  }'
```

### Passo 5: Build para produção
```bash
mvn clean package -DskipTests

# Resultado
java -jar target/leidycleaner-api-1.0.0.jar
```

---

## 📊 Checklist de Implementação

- [ ] Setup Spring Boot + dependências
- [ ] Configurar application.properties
- [ ] Copiar database.sqlite
- [ ] Criar entidades JPA (User, Service, Booking)
- [ ] Criar Repositories
- [ ] Implementar JWT (tokenProvider + filter)
- [ ] Criar DTOs
- [ ] Implementar Services
- [ ] Criar Controllers
- [ ] Testar com CURL
- [ ] Testes unitários
- [ ] Build para JAR
- [ ] Documentação final

---

**Você tem tudo pronto para os próximos 24h! 🚀**
