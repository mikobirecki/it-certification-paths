# Feature Specification: Interactive Certification Path Map

**Feature Branch**: `001-interactive-cert-map`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: User description: "Zbuduj interaktywną mapę ścieżek certyfikacji IT inspirowaną układem Azure Certification Poster, ale rozszerzoną o inteligentne rekomendacje co dalej."

## Clarifications

### Session 2026-03-22

- Q: Jaki zakres dostawców obejmuje MVP? → A: MVP tylko dla Azure.
- Q: Jak wybieramy rekomendowaną kolejność certyfikatów w MVP? → A: Najkrótsza ścieżka do celu (minimalna liczba kroków).
- Q: Czy zapisujemy stan użytkownika w MVP? → A: Tak, lokalnie w przeglądarce.
- Q: Jak aktualizujemy dane certyfikacji w MVP? → A: Ręcznie (curated), z obowiązkową weryfikacją zmian i dzisiejszym przeglądem aktualności danych.
- Q: Ile ról obejmuje MVP? → A: Wszystkie role Azure dostępne w aktualnym katalogu certyfikacji.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Przegląd mapy certyfikacji (Priority: P1)

Jako osoba planująca rozwój zawodowy chcę zobaczyć interaktywną mapę certyfikacji
z poziomami i zależnościami, abym mógł szybko zrozumieć możliwe ścieżki rozwoju.

**Why this priority**: Bez czytelnej mapy użytkownik nie ma punktu odniesienia do
planowania kolejnych kroków i nie zobaczy wartości produktu.

**Independent Test**: Funkcję można przetestować niezależnie, gdy użytkownik otwiera
aplikację, przegląda mapę, klika wybrane certyfikaty i otrzymuje ich szczegóły bez
użycia panelu rekomendacji.

**Acceptance Scenarios**:

1. **Given** użytkownik otwiera mapę, **When** przegląda widok,
   **Then** widzi certyfikaty pogrupowane co najmniej wg poziomów: Foundational,
   Associate, Expert, Specialty.
2. **Given** użytkownik klika certyfikat,
   **When** otwiera się panel szczegółów,
   **Then** użytkownik widzi nazwę certyfikatu, poziom, obszar, docelowe role oraz
   wymagane/zalecane poprzednie certyfikaty.

---

### User Story 2 - Inteligentna rekomendacja co dalej (Priority: P2)

Jako użytkownik chcę wskazać docelową rolę i aktualne certyfikaty, aby otrzymać
rekomendowaną kolejność następnych certyfikatów.

**Why this priority**: Rekomendacje są kluczowym wyróżnikiem względem statycznego
posteru i dostarczają największą wartość decyzyjną.

**Independent Test**: Funkcję można przetestować niezależnie przez podanie różnych
zestawów wejściowych (rola + posiadane certyfikaty) i sprawdzenie, czy wynikowa
ścieżka jest kompletna, logiczna i zgodna z zależnościami.

**Acceptance Scenarios**:

1. **Given** użytkownik wybiera rolę docelową i podaje posiadane certyfikaty,
   **When** uruchamia rekomendację,
   **Then** system zwraca uporządkowaną listę kolejnych certyfikatów.
2. **Given** rekomendowana ścieżka zawiera kilka możliwych wariantów,
   **When** system prezentuje wynik,
   **Then** użytkownik widzi ścieżkę główną i co najmniej jedną alternatywę wraz z
   uzasadnieniem.

---

### User Story 3 - Filtrowanie i porównywanie widoków (Priority: P3)

Jako użytkownik chcę filtrować mapę i listę certyfikatów po roli, poziomie,
dostawcy i obszarze, aby szybko skupić się na interesującej mnie ścieżce.

**Why this priority**: Filtrowanie zwiększa użyteczność przy rosnącej liczbie
certyfikatów i ogranicza przeciążenie informacyjne.

**Independent Test**: Funkcję można przetestować niezależnie, gdy użytkownik ustawia
filtry i widzi spójne wyniki zarówno na mapie, jak i w widoku tabelarycznym.

**Acceptance Scenarios**:

1. **Given** użytkownik ustawia filtry,
   **When** przełącza się między mapą a tabelą,
   **Then** oba widoki prezentują ten sam zestaw certyfikatów i relacji.
2. **Given** użytkownik czyści wszystkie filtry,
   **When** reset zostaje wykonany,
   **Then** system przywraca pełny widok mapy bez utraty responsywności.

---

### Edge Cases

- Użytkownik nie wskazał żadnych posiadanych certyfikatów i oczekuje ścieżki od zera.
- Użytkownik ma certyfikaty z kilku różnych poziomów, które tworzą nieciągłą historię.
- Dla wybranej roli nie istnieje jedna oczywista ścieżka i trzeba pokazać równorzędne alternatywy.
- W danych pojawia się certyfikat bez wymaganych atrybutów (np. brak poziomu lub obszaru).
- Relacje zależności tworzą pętlę lub prowadzą do certyfikatu nieistniejącego w zbiorze.
- Liczba certyfikatów rośnie powyżej 100 i użytkownik wykonuje szybkie sekwencje filtrów.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prezentować interaktywną mapę certyfikatów z relacjami
  zależności między certyfikatami.
- **FR-002**: System MUST klasyfikować każdy certyfikat co najmniej po: poziomie,
  obszarze, dostawcy i docelowych rolach.
- **FR-003**: Użytkownik MUST móc przełączać widok między mapą i listą/tabelą bez
  utraty kontekstu filtrów.
- **FR-004**: System MUST umożliwiać filtrowanie po roli, poziomie, dostawcy i
  obszarze tematycznym; w MVP filtr dostawcy MUST być ograniczony do wartości Azure
  (single-value, bez przełączania na innych dostawców).
- **FR-005**: System MUST umożliwiać wybór docelowej roli i aktualnie posiadanych
  certyfikatów jako wejścia do rekomendacji.
- **FR-006**: System MUST generować rekomendowaną kolejność kolejnych certyfikatów
  zgodną z wymaganymi zależnościami certyfikacyjnymi i bez pomijania kroków obowiązkowych.
- **FR-006a**: System MUST wyznaczać główną rekomendację jako najkrótszą poprawną
  ścieżkę do celu, mierzoną minimalną liczbą wymaganych kroków certyfikacyjnych.
- **FR-007**: System MUST prezentować alternatywne ścieżki, gdy istnieje więcej niż
  jedna poprawna droga osiągnięcia celu.
- **FR-008**: System MUST pokazywać dla każdego kroku ścieżki orientacyjny wysiłek
  nauki i poziom trudności.
- **FR-009**: System MUST zapewnić pełny panel szczegółów certyfikatu obejmujący
  wymagania, obszar, poziom i rekomendowane następne kroki.
- **FR-010**: System MUST walidować spójność danych certyfikacji i blokować
  publikację danych niespójnych lub niekompletnych.
- **FR-011**: System MUST umożliwiać aktualizację zbioru certyfikatów bez ręcznej
  przebudowy wszystkich relacji.
- **FR-011a**: Każda aktualizacja katalogu certyfikatów MUST przechodzić checklistę
  weryfikacji obejmującą co najmniej: poprawność atrybutów, poprawność zależności,
  oraz zgodność z aktualnym oficjalnym katalogiem certyfikacji Azure.
- **FR-011b**: Proces MVP MUST wspierać ręczny przegląd i szybkie dodanie zmian,
  jeżeli w oficjalnych certyfikacjach pojawią się nowe pozycje lub modyfikacje.
- **FR-012**: System MUST pozostawać użyteczny na urządzeniach mobilnych i desktopowych.
- **FR-013**: System MUST utrzymywać responsywność interakcji podczas przeglądania
  i filtrowania dużych map certyfikacji.
- **FR-014**: System MUST zapisywać lokalnie stan użytkownika (wybrana rola,
  posiadane certyfikaty i filtry), aby odtworzyć kontekst po odświeżeniu strony.
- **FR-015**: System MUST nie wymagać konta użytkownika ani logowania w MVP,
  a interfejs MVP MUST nie zawierać przepływów rejestracji, logowania ani odzyskiwania hasła.
- **FR-016**: System MUST obsługiwać wszystkie role Azure z aktualnego katalogu
  certyfikacji i umożliwiać generowanie rekomendacji dla każdej z nich.

### Assumptions

- MVP obejmuje wyłącznie ekosystem certyfikacji Azure,
  z pełnym zakresem ról Azure i możliwością rozszerzenia na kolejnych dostawców
  w następnych iteracjach.
- Rekomendacje opierają się na regułach eksperckich i zależnościach,
  a główna rekomendacja wybierana jest jako najkrótsza poprawna ścieżka,
  bez personalizowanego modelu scoringowego w MVP.
- Estymacje czasu i trudności mają charakter orientacyjny i służą planowaniu,
  nie formalnej gwarancji.
- Stan użytkownika jest przechowywany wyłącznie lokalnie na urządzeniu użytkownika
  w ramach MVP.
- Aktualizacje katalogu certyfikacji są wykonywane ręcznie i zatwierdzane po
  przejściu checklisty weryfikacyjnej.

### Key Entities *(include if feature involves data)*

- **Certification**: Pojedynczy certyfikat z atrybutami: nazwa, poziom,
  dostawca, obszar, role docelowe, orientacyjny czas przygotowania,
  poziom trudności.
- **CertificationDependency**: Relacja między certyfikatami określająca,
  który certyfikat jest wymagany lub zalecany przed kolejnym.
- **RoleProfile**: Definicja roli zawodowej i powiązanych certyfikatów,
  które najczęściej prowadzą do osiągnięcia tej roli.
- **RecommendationRequest**: Zestaw danych wejściowych od użytkownika,
  zawierający rolę docelową, posiadane certyfikaty i poziom doświadczenia.
- **RecommendationPath**: Wynik rekomendacji zawierający uporządkowane kroki,
  alternatywne warianty i uzasadnienie kolejności.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Co najmniej 90% użytkowników testowych znajduje rekomendowaną ścieżkę
  dla wybranej roli w czasie krótszym niż 2 minuty od wejścia do aplikacji,
  mierzone w moderowanym teście zadaniowym na minimum 10 użytkownikach testowych.
- **SC-002**: Co najmniej 95% wygenerowanych rekomendacji nie zawiera naruszeń
  zależności (brak kroków pomijających wymagane certyfikaty).
- **SC-003**: Co najmniej 95% interakcji filtrowania i przełączania widoków kończy się
  aktualizacją interfejsu w czasie poniżej 100 ms dla katalogu 100+ certyfikatów
  na urządzeniu klasy desktop.
- **SC-004**: Co najmniej 85% użytkowników ocenia mapę jako czytelną i pomocną
  w planowaniu kolejnych certyfikatów, mierzone ankietą po wykonaniu scenariusza US1.
- **SC-005**: Widok główny osiąga wynik Lighthouse Performance >= 90 dla buildu
  produkcyjnego na desktopie przy katalogu obejmującym minimum 100 certyfikatów i ich relacji.
- **SC-006**: Zmiany w oficjalnym katalogu Azure mogą zostać zweryfikowane i
  odzwierciedlone w danych produktu w ciągu jednego cyklu aktualizacji danych,
  gdzie cykl oznacza maksymalnie 1 dzień roboczy od wykrycia zmiany.
