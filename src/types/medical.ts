
export interface MedicalStats {
    birthDate: string;
    calculatedAt: string;
    medicalDisclaimer: string;
    dataSourcesValidation: string;
    basicInfo: {
        ageInYears: number;
        ageInMonths: number;
        ageInWeeks: number;
        ageInDays: number;
        ageInHours: number;
        ageInMinutes: number;
        ageInSeconds: number;
    };
    respiratory: {
        totalBreaths: number;
        totalAirVolumeL: number;
        oxygenConsumedL: number;
        co2ProducedL: number;
        alveolarVentilationL: number;
        respiratoryMuscleContractions: number;
        lungExpansionCycles: number;
        gasExchangeEvents: number;
    };
    cardiovascular: {
        heartBeatsTotal: number;
        bloodPumpedL: number;
        strokeVolumeTotal: number;
        heartWorkEnergy: number;
        circulationCycles: number;
        bloodDistanceKM: number;
        redBloodCellsProduced: number;
        arterialPulsations: number;
        capillaryPerfusions: number;
    };
    neurological: {
        actionPotentials: number;
        synapticTransmissions: number;
        brainEnergyConsumedKJ: number;
        neurotransmitterReleases: number;
        brainOxygenConsumedL: number;
        memoryConsolidations: number;
        cerebrospinalFluidTurnovers: number;
        brainElectricalActivityMV: number;
        cognitiveProcesses: number;
    };
    digestive: {
        salivaProducedL: number;
        gastricJuiceProducedL: number;
        bileProducedL: number;
        pancreaticJuiceL: number;
        peristalticWaves: number;
        digestiveEnzymeProduction: number;
        nutrientAbsorptionEvents: number;
        intestinalCellRenewal: number;
    };
    renal: {
        bloodFilteredL: number;
        urineProducedL: number;
        glomerularFiltrateL: number;
        sodiumProcessedKG: number;
        waterReabsorbedL: number;
        toxinsFiltered: number;
        nephronFiltrations: number;
        acidBaseCorrections: number;
    };
    immuneSystem: {
        whiteCellsProduced: number;
        antibodiesGenerated: number;
        skinCellsRenewed: number;
        pathogensEliminated: number;
        immuneResponses: number;
        inflammationReactions: number;
        woundHealingCycles: number;
        macrophageActivations: number;
    };
    cellularActivity: {
        cellsReplaced: number;
        atpProducedMoles: number;
        proteinsProducedKG: number;
        dnaRepairOperations: number;
        enzymaticReactions: number;
        mitochondrialOperations: number;
        cellularRespirations: number;
        metabolicProcesses: number;
    };
    sensory: {
        eyeBlinks: number;
        eyeMovements: number;
        visualSignalsProcessed: number;
        soundsProcessed: number;
        tasteSignals: number;
        smellSignals: number;
        touchSensations: number;
        painSignalsProcessed: number;
        balanceCorrections: number;
    };
    endocrineSystem: {
        hormonalPulses: number;
        insulinSecretions: number;
        cortisolReleases: number;
        growthHormoneSecretions: number;
        thyroidAdjustments: number;
        metabolicRegulations: number;
        feedbackLoopActivations: number;
        hormonalCascades: number;
    };
    musculoskeletal: {
        muscleContractions: number;
        boneRemodelingCycles: number;
        calciumProcessedKG: number;
        muscleProteinSynthesisKG: number;
        jointMovements: number;
        postureAdjustments: number;
        balanceReflexes: number;
        locomotorPatterns: number;
    };
    metabolicSummary: {
        totalCaloriesBurned: number;
        waterProcessedL: number;
        oxygenConsumedL: number;
        energyProducedKJ: number;
        heatGeneratedKcal: number;
        wasteProductsKG: number;
        electrolyteBalance: number;
        phRegulations: number;
    };
    amazingFacts: {
        totalBodyCells: number;
        bacterialCells: number;
        totalDnaLengthKM: number;
        neuronConnections: number;
        bloodVesselLengthKM: number;
        boneStrengthPSI: number;
        muscleEfficiencyPercent: number;
        brainComputingPower: string;
        geneticInformation: string;
        cellularComplexity: string;
    };
    lifeComparison: {
        worldLifeExpectancy: number;
        percentageOfLifeLived: number;
        estimatedRemainingYears: number;
        biologicalSystemsOptimal: string;
        cellularAgeRatio: number;
        physiologicalMaturity: string;
    };
}

export interface MedicalApiResponse {
    status: boolean;
    data: MedicalStats;
}
