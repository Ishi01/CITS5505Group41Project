
```mermaid
erDiagram
    users ||--o{ games : play
    users {
        INTEGER id PK
        VARCHAR(64) username
        VARCHAR(120) email
        VARCHAR(128) password_hash
    }
    games {
        INTEGER id PK
        DATATIME timestamp
        INTEGER result
        INTEGER users_id FK
    }
```