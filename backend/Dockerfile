# ==============================================================================
# ESTÁGIO 1: Build da Aplicação Spring Boot
# ==============================================================================
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Copia dependências do Maven Wrapper
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Baixa dependências para cache
RUN ./mvnw dependency:go-offline -B

# Copia código-fonte e compila gerando o JAR executável
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ==============================================================================
# ESTÁGIO 2: Imagem Final Leve para Produção (JRE Alpine)
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Cria usuário não-root por segurança (OWASP)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copia apenas o artefato JAR compilado
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar

EXPOSE 8081

# Parâmetros otimizados para container (cgroups e gerenciamento de memória JVM)
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

