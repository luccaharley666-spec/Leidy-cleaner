# ☕ Integração Java/Spring - Plano 24 Horas

**Objetivo:** Pegar seu banco de dados + APIs do Leidy Cleaner e rodar em Java/Spring  
**Tempo:** 24 horas  
**Nível de Dificuldade:** Intermediário

---

## 🎯 Overview do que Fazer

```
Hora 0-2:    Setup do projeto Spring Boot
Hora 2-6:    Importar banco SQLite em JPA
Hora 6-12:   Criar controllers REST mirroring Node.js
Hora 12-18:  Testar APIs completas
Hora 18-24:  Refinar, documentar, testar mobile
```

---

## ⏰ HORA 0-2: Setup Spring Boot

### Passo 1: Criar projeto Spring Boot

```bash
# Opção 1: Usando Spring Initializr CLI
spring boot new --name leidycleaner --type gradle

# Opção 2: Usando Maven archetype
mvn archetype:generate \
  -DgroupId=com.leidycleaner \
  -DartifactId=leidycleaner-api \
  -[REDACTED_TOKEN]=[REDACTED_TOKEN]

# Opção 3: Direto (recomendado - mais rápido)
git clone https://github.com/spring-projects/spring-boot/
cd spring-boot
./mvnw clean install (ignorar, apenas estrutura)
```

### Passo 2: pom.xml (Maven) ou build.gradle (Gradle)

#### Se usar Maven (pom.xml):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.leidycleaner</groupId>
    <artifactId>leidycleaner-api</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>[REDACTED_TOKEN]</artifactId>
        <version>3.2.0</version>
    </parent>

    <dependencies>
        <!-- Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>[REDACTED_TOKEN]</artifactId>
        </dependency>

        <!-- JPA/Hibernate -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>[REDACTED_TOKEN]</artifactId>
        </dependency>

        <!-- SQLite -->
        <dependency>
            <groupId>org.xerial</groupId>
            <artifactId>sqlite-jdbc</artifactId>
            <version>3.44.0.0</version>
        </dependency>

        <!-- Security/JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>[REDACTED_TOKEN]</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>

        <!-- BCrypt -->
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>[REDACTED_TOKEN]</artifactId>
        </dependency>

        <!-- Lombok (reduz boilerplate) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>[REDACTED_TOKEN]</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>[REDACTED_TOKEN]</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### Se usar Gradle (build.gradle):
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.[REDACTED_TOKEN]' version '1.1.4'
}

group = 'com.leidycleaner'
version = '1.0.0'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:[REDACTED_TOKEN]'
    implementation 'org.springframework.boot:[REDACTED_TOKEN]'
    implementation 'org.xerial:sqlite-jdbc:3.44.0.0'
    implementation 'org.springframework.boot:[REDACTED_TOKEN]'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:[REDACTED_TOKEN]'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### Passo 3: application.properties

```properties
# Server
server.port=8080

# Database SQLite
spring.datasource.url=jdbc:sqlite:./leidycleaner.sqlite
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=validate

# JWT
app.jwt.secret=[REDACTED_TOKEN]
app.jwt.expiration=86400000

# CORS
corsAllowedOrigins=http://localhost:3000,http://localhost:8080

# Logs
logging.level.root=INFO
logging.level.com.leidycleaner=DEBUG
```

---

## ⏰ HORA 2-6: Importar Banco SQLite em JPA

### Passo 1: Copiar banco SQLite

```bash
# Do seu servidor
scp user@server:/workspaces/acaba/backend/backend_data/database.sqlite ./

# Ou local (se já tem na máquina)
cp ~/leidy-export/database.sqlite ./leidycleaner.sqlite

# Verificar banco
sqlite3 leidycleaner.sqlite ".tables"
# Deve mostrar: users services bookings transactions payments reviews notifications chat_messages
```

### Passo 2: Criar Entidades JPA

**Arquivo: `src/main/java/com/leidycleaner/entity/User.java`**

```java
package com.leidycleaner.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column
    private String phone;

    @Column
    private String address;

    @Column
    private String role; // ADMIN, MANAGER, STAFF, CLIENT

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
```

**Arquivo: `src/main/java/com/leidycleaner/entity/Service.java`**

```java
package com.leidycleaner.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column
    private String category;

    @Column
    private String duration;

    @Column
    private Double basePrice;

    @Column
    private Boolean isActive;

    @Column(name = "created_at")
    private String createdAt;
}
```

**Arquivo: `src/main/java/com/leidycleaner/entity/Booking.java`**

```java
package com.leidycleaner.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    @Column
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED

    @Column(name = "scheduled_date")
    private String scheduledDate;

    @Column(name = "scheduled_time")
    private String scheduledTime;

    @Column
    private Double totalPrice;

    @Column
    private String notes;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
```

### Passo 3: Criar Repositories

**Arquivo: `src/main/java/com/leidycleaner/repository/UserRepository.java`**

```java
package com.leidycleaner.repository;

import com.leidycleaner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

**Arquivo: `src/main/java/com/leidycleaner/repository/ServiceRepository.java`**

```java
package com.leidycleaner.repository;

import com.leidycleaner.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByIsActiveTrue();
}
```

**Arquivo: `src/main/java/com/leidycleaner/repository/BookingRepository.java`**

```java
package com.leidycleaner.repository;

import com.leidycleaner.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByClientId(Long clientId);
    List<Booking> findByStatus(String status);
}
```

---

## ⏰ HORA 6-12: Criar Controllers REST

### Passo 1: Controller de Autenticação

**Arquivo: `src/main/java/com/leidycleaner/dto/LoginRequest.java`**

```java
package com.leidycleaner.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
```

**Arquivo: `src/main/java/com/leidycleaner/dto/LoginResponse.java`**

```java
package com.leidycleaner.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserDTO user;
}
```

**Arquivo: `src/main/java/com/leidycleaner/service/AuthService.java`**

```java
package com.leidycleaner.service;

import com.leidycleaner.entity.User;
import com.leidycleaner.dto.LoginRequest;
import com.leidycleaner.dto.LoginResponse;
import com.leidycleaner.dto.UserDTO;
import com.leidycleaner.repository.UserRepository;
import com.leidycleaner.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.[REDACTED_TOKEN](user.getId());
        
        UserDTO userDTO = UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .build();
        
        return new LoginResponse(accessToken, refreshToken, userDTO);
    }
}
```

**Arquivo: `src/main/java/com/leidycleaner/controller/AuthController.java`**

```java
package com.leidycleaner.controller;

import com.leidycleaner.dto.LoginRequest;
import com.leidycleaner.dto.LoginResponse;
import com.leidycleaner.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
```

### Passo 2: Controller de Serviços

**Arquivo: `src/main/java/com/leidycleaner/controller/ServiceController.java`**

```java
package com.leidycleaner.controller;

import com.leidycleaner.entity.Service;
import com.leidycleaner.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceController {
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceRepository.findByIsActiveTrue();
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Service> getService(@PathVariable Long id) {
        Service service = serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        return ResponseEntity.ok(service);
    }
    
    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service) {
        Service saved = serviceRepository.save(service);
        return ResponseEntity.ok(saved);
    }
}
```

### Passo 3: Controller de Agendamentos

**Arquivo: `src/main/java/com/leidycleaner/controller/BookingController.java`**

```java
package com.leidycleaner.controller;

import com.leidycleaner.entity.Booking;
import com.leidycleaner.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingRepository.findByClientId(userId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return ResponseEntity.ok(bookings);
    }
    
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
        @PathVariable Long id, 
        @RequestBody Booking booking) {
        
        Booking existing = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        existing.setStatus(booking.getStatus());
        existing.setNotes(booking.getNotes());
        
        Booking updated = bookingRepository.save(existing);
        return ResponseEntity.ok(updated);
    }
}
```

---

## ⏰ HORA 12-18: Testar APIs

### Passo 1: Rodar aplicação

```bash
# Se maven
mvn clean package
mvn spring-boot:run

# Se gradle
./gradlew bootRun
```

### Passo 2: Testar endpoints

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leidycleaner.com.br","password":"AdminPassword123!@#"}'

# Listar serviços
curl http://localhost:8080/api/services

# Listar agendamentos do usuário
curl http://localhost:8080/api/bookings/1

# Criar agendamento
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "serviceId": 1,
    "status": "PENDING",
    "scheduledDate": "2026-02-15",
    "scheduledTime": "10:00",
    "totalPrice": 150.00
  }'
```

### Passo 3: Testar no Insomnia/Postman

Importar arquivo de requests:

```json
{
  "client": "Insomnia Core",
  "clientVersion": "2023.5.8",
  "collections": [
    {
      "_id": "col_leidycleaner",
      "name": "Leidy Cleaner API",
      "requests": [
        {
          "name": "Login",
          "method": "POST",
          "url": "http://localhost:8080/api/auth/login",
          "body": {
            "mimeType": "application/json",
            "text": "{\"email\":\"admin@leidycleaner.com.br\",\"password\":\"AdminPassword123!@#\"}"
          }
        },
        {
          "name": "Get Services",
          "method": "GET",
          "url": "http://localhost:8080/api/services"
        },
        {
          "name": "Get Bookings",
          "method": "GET",
          "url": "http://localhost:8080/api/bookings/1"
        }
      ]
    }
  ]
}
```

---

## ⏰ HORA 18-24: Refinar & Documentar

### Passo 1: Adicionar tratamento de erros

**Arquivo: `src/main/java/com/leidycleaner/exception/[REDACTED_TOKEN].java`**

```java
package com.leidycleaner.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.[REDACTED_TOKEN];

@[REDACTED_TOKEN]
public class [REDACTED_TOKEN] {
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> [REDACTED_TOKEN](RuntimeException e) {
        ErrorResponse error = new ErrorResponse("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    public static class ErrorResponse {
        public String status;
        public String message;
        
        public ErrorResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }
}
```

### Passo 2: Swagger/OpenAPI (opcional mas recomendado)

```xml
<!-- Adicionar ao pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>[REDACTED_TOKEN]</artifactId>
    <version>2.0.0</version>
</dependency>
```

Depois acessar: `http://localhost:8080/swagger-ui.html`

### Passo 3: Fazer build final

```bash
# Se Maven
mvn clean package -DskipTests

# Se Gradle
./gradlew build

# Arquivo JAR gerado
ls -lh target/leidycleaner-api-1.0.0.jar
# ou
ls -lh build/libs/leidycleaner-api-1.0.0.jar
```

### Passo 4: Documentação final

Criar arquivo `DEPLOYMENT.md`:

```markdown
# Deployment Java/Spring

## Build
```bash
mvn clean package
```

## Run
```bash
# Development
mvn spring-boot:run

# Production
java -jar target/leidycleaner-api-1.0.0.jar
```

## Configuração Produção
Editar `application-prod.properties` e executar com:
```bash
java -Dspring.profiles.active=prod -jar target/leidycleaner-api-1.0.0.jar
```
```

---

## 🗂️ Estrutura de Pastas Final

```
leidycleaner-api/
├── src/
│   ├── main/
│   │   ├── java/com/leidycleaner/
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ServiceController.java
│   │   │   │   └── BookingController.java
│   │   │   ├── service/
│   │   │   │   └── AuthService.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Service.java
│   │   │   │   └── Booking.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ServiceRepository.java
│   │   │   │   └── BookingRepository.java
│   │   │   ├── dto/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── LoginResponse.java
│   │   │   │   └── UserDTO.java
│   │   │   ├── security/
│   │   │   │   └── JwtTokenProvider.java
│   │   │   ├── exception/
│   │   │   │   └── [REDACTED_TOKEN].java
│   │   │   └── [REDACTED_TOKEN].java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-prod.properties
│   └── test/
│       └── java/com/leidycleaner/
│           └── [REDACTED_TOKEN].java
├── pom.xml (ou build.gradle)
├── leidycleaner.sqlite
└── README.md
```

---

## ⚡ Checklis de 24 Horas

| Hora | Tarefa | Status |
|------|--------|--------|
| 0-2 | Setup Spring Boot | ⬜ |
| 2-6 | JPA + SQLite | ⬜ |
| 6-12 | Controllers REST | ⬜ |
| 12-18 | Testes API | ⬜ |
| 18-24 | Polish + Deploy | ⬜ |

---

## 🎯 Endpoints a Implementar

```
POST   /api/auth/login              → Autenticação
GET    /api/services                → Listar serviços
GET    /api/services/{id}           → Detalhe serviço
POST   /api/bookings                → Criar agendamento
GET    /api/bookings/{userId}       → Agendamentos do usuário
PUT    /api/bookings/{id}           → Atualizar agendamento
GET    /api/health                  → Health check

Opcionais (se tempo):
GET    /api/pricing/hour-packages   → Tabela de preços
GET    /api/users/{id}              → Dados usuário
POST   /api/reviews                 → Criar avaliação
GET    /api/chat/{bookingId}        → Mensagens chat
```

---

## 🚀 Dicas Finais

1. **Use Lombok** - Reduz boilerplate enormemente
2. **Test com Postman/Insomnia** - Valide cada endpoint
3. **SQLite funciona direto** - Não precisa de servidor extra
4. **JWT no header** - Authorization: Bearer TOKEN
5. **Backup banco** - Antes de fazer alterações
6. **Git commits** - A cada milestone completado

---

## 📊 Comparação Node.js vs Java/Spring

| Aspecto | Node.js | Java/Spring |
|---------|---------|-------------|
| Setup | 5 min | 15 min |
| Performance | Rápido | Mais rápido |
| Escalabilidade | Boa | Excelente |
| Curva aprendizado | Fácil | Intermediária |
| Build para produção | Simples | JAR único |
| Deploy | Container | JAR ou Docker |

---

**Tudo pronto! Com 24h você consegue! 🚀**
