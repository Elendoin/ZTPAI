# Popdle

## Opis Projektu

Popdle to aplikacja webowa do codziennych quizów z funkcjonalnością społecznościową. Użytkownicy mogą uczestniczyć w codziennych wyzwaniach, składać własne sugestie pytań oraz śledzić swoje statystyki. Aplikacja oferuje system uwierzytelniania z rolami użytkowników oraz interfejs administracyjny do zarządzania treścią.

## Schemat Architektury

```
┌────────────────────────────────────────────────────────────────┐
│                           FRONTEND                             │
│                        React + Vite                            │
│  ┌───────────────┐ ┌──────────────┐ ┌──────────────────────┐   │
│  │ Login/Register│ │ Daily Quiz   │ │   Suggestions        │   │
│  └───────────────┘ └──────────────┘ └──────────────────────┘   │
│  ┌───────────────┐ ┌──────────────┐ ┌──────────────────────┐   │
│  │  Navigation   │ │ User Mgmt    │ │   Admin Dashboard    │   │
│  └───────────────┘ └──────────────┘ └──────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                                │
                               HTTP/REST API
                                │
┌────────────────────────────────────────────────────────────────┐
│                           BACKEND                              │
│                      Spring Boot 3.4.3                         │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  CONTROLLERS                            │   │
│  │  ┌─────────┐ ┌─────────────┐ ┌─────────┐ ┌──────────┐   │   │
│  │  │  Auth   │ │ Questions   │ │Suggest. │ │  Users   │   │   │
│  │  └─────────┘ └─────────────┘ └─────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                │                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SERVICES                              │   │
│  │  ┌─────────┐ ┌─────────────┐ ┌─────────┐ ┌──────────┐   │   │
│  │  │AuthServ.│ │QuestionServ.│ │SuggServ.│ │UserServ. │   │   │
│  │  └─────────┘ └─────────────┘ └─────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                │                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                REPOSITORIES                             │   │
│  │              Spring Data JPA                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                │                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  SECURITY                               │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐    │   │
│  │  │JWT Filter   │ │  Security   │ │  Custom User    │    │   │
│  │  │             │ │  Config     │ │  Details Serv.  │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                                │
                          JPA/Hibernate
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
│                      PostgreSQL                                 │
│                                                                 │
│  ┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐   │
│  │ Users   │ │ Questions   │ │ Suggestions │ │UserSuggestion│   │
│  │         │ │             │ │             │ │              │   │
│  │ - id    │ │ - id        │ │ - id        │ │ - user_id    │   │
│  │ - email │ │ - question  │ │ - title     │ │ - sugg_id    │   │
│  │ - role  │ │ - answer    │ │ - desc      │ │ - liked      │   │
│  │ - stats │ │ - date      │ │ - image     │ │              │   │
│  └─────────┘ └─────────────┘ └─────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Użyte Technologie

### Backend
- **Spring Boot**
- **PostgreSQL**
- **Gradle** 
- **Swagger/OpenAPI 3**

### Frontend
- **React 18**
- **Vite**

Wybór technologii dokonany na podstawie ciekawości ich działania i trendów.


## Instrukcje Uruchomienia

### Uruchomienie Backendu
   ./gradlew build\
   ./gradlew bootRun\
   Backend będzie dostępny pod adresem: `http://localhost:8080`\
   Swagger UI: `http://localhost:8080/swagger-ui.html`

### Uruchomienie Frontendu
   cd react-app\
   npm install\
   npm run dev\
   Frontend będzie dostępny pod adresem: `http://localhost:5173`


## ERD
![ERD](/githubimg/ERD.png)