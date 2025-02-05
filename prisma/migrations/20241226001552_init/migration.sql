-- CreateTable
CREATE TABLE "Banco_horas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "saida" TIMESTAMP(3),
    "tempoUtilizado" INTEGER,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Banco_horas_pkey" PRIMARY KEY ("id")
);
