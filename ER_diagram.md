
```mermaid
erDiagram
    users ||--o{ games : play
    users {
        INTEGER id PK
        VARCHAR(64) username
        VARCHAR(120) email
        VARCHAR(128) password_hash
        %% relation attribute games define in User class %%
        %% i am a comments %%
    }
    games {
        INTEGER id PK
        DATATIME timestamp
        INTEGER score
        INTEGER users_id FK
        %%  relation attribute: player %%
    }

    users ||--o{ quiz_questions : create
    quiz_questions {
        INTEGER question_id PK
        VARCHAR(100) game_name NOT NULL
        VARCHAR(255) description NOT NULL
        INTEGER user_id FK
        VARCHAR(50) category NOT NULL
        VARCHAR(200) question_text NOT NULL
        TEXT answer NOT NULL
        VARCHAR(100) location NULL
        %% relation attribute: user defined in QuizQuestion class %%
    }
```