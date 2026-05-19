
import React, { useState } from 'react';
import type { MedicalStats } from '../types/medical';
import { Activity, Heart, Brain, Wind, Eye, Shield, Dna, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface MedicalFactCardProps {
    data: MedicalStats;
}

const formatNumber = (num: number) => {
    if (num >= 1e15) return (num / 1e15).toFixed(2) + ' Q';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + ' T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M';
    return num.toLocaleString();
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; isOpen: boolean; onToggle: () => void }> = ({
    title, icon, children, isOpen, onToggle
}) => (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 mb-2">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
        >
            <div className="flex items-center gap-2 text-primary font-bold">
                {icon}
                <span>{title}</span>
            </div>
            <span className={clsx("transition-transform", isOpen ? "rotate-180" : "")}>▼</span>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-3 space-y-2 text-sm text-gray-300 border-t border-white/5">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const StatRow = ({ label, value, unit = '' }: { label: string; value: string | number; unit?: string }) => (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
        <span className="text-gray-400 text-xs md:text-sm">{label}</span>
        <span className="font-mono text-white text-xs md:text-sm font-medium text-right ml-4">
            {typeof value === 'number' ? formatNumber(value) : value} {unit}
        </span>
    </div>
);

const MedicalFactCard: React.FC<MedicalFactCardProps> = ({ data }) => {
    const [openSection, setOpenSection] = useState<string>('overview');

    const toggle = (section: string) => setOpenSection(openSection === section ? '' : section);

    return (
        <div className="w-full max-w-xl bg-dark-lighter border border-primary/20 rounded-2xl overflow-hidden shadow-2xl my-4">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-primary/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Biological Stats Analysis</h3>
                        <p className="text-xs text-primary/80">Since {data.birthDate}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <span className="block text-xs text-gray-400">Age</span>
                        <span className="text-sm font-mono text-white">{data.basicInfo.ageInYears} Years</span>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <span className="block text-xs text-gray-400">Total Heartbeats</span>
                        <span className="text-sm font-mono text-primary">{formatNumber(data.cardiovascular.heartBeatsTotal)}</span>
                    </div>
                </div>
            </div>

            <div className="p-3 max-h-[60vh] overflow-y-auto custom-scrollbar">

                <Section title="Heart & Blood" icon={<Heart className="w-4 h-4" />} isOpen={openSection === 'cardio'} onToggle={() => toggle('cardio')}>
                    <StatRow label="Blood Pumped" value={data.cardiovascular.bloodPumpedL} unit="L" />
                    <StatRow label="Circulation Cycles" value={data.cardiovascular.circulationCycles} />
                    <StatRow label="Blood Distance" value={data.cardiovascular.bloodDistanceKM} unit="Km" />
                    <StatRow label="Red Blood Cells" value={data.cardiovascular.redBloodCellsProduced} />
                </Section>

                <Section title="Respiratory" icon={<Wind className="w-4 h-4" />} isOpen={openSection === 'resp'} onToggle={() => toggle('resp')}>
                    <StatRow label="Total Breaths" value={data.respiratory.totalBreaths} />
                    <StatRow label="Air Volume" value={data.respiratory.totalAirVolumeL} unit="L" />
                    <StatRow label="Oxygen Used" value={data.respiratory.oxygenConsumedL} unit="L" />
                    <StatRow label="CO2 Produced" value={data.respiratory.co2ProducedL} unit="L" />
                </Section>

                <Section title="Brain & Nerves" icon={<Brain className="w-4 h-4" />} isOpen={openSection === 'neuro'} onToggle={() => toggle('neuro')}>
                    <StatRow label="Brain Energy" value={data.neurological.brainEnergyConsumedKJ} unit="KJ" />
                    <StatRow label="Synaptic Transmissions" value={data.neurological.synapticTransmissions} />
                    <StatRow label="Cognitive Processes" value={data.neurological.cognitiveProcesses} />
                    <StatRow label="CSF Turnovers" value={data.neurological.cerebrospinalFluidTurnovers} />
                </Section>

                <Section title="Cellular Activity" icon={<Dna className="w-4 h-4" />} isOpen={openSection === 'cell'} onToggle={() => toggle('cell')}>
                    <StatRow label="Cells Replaced" value={data.cellularActivity.cellsReplaced} />
                    <StatRow label="DNA Repair Ops" value={data.cellularActivity.dnaRepairOperations} />
                    <StatRow label="Proteins Produced" value={data.cellularActivity.proteinsProducedKG} unit="Kg" />
                    <StatRow label="Mitochondrial Ops" value={data.cellularActivity.mitochondrialOperations} />
                </Section>

                <Section title="Sensory" icon={<Eye className="w-4 h-4" />} isOpen={openSection === 'sensory'} onToggle={() => toggle('sensory')}>
                    <StatRow label="Blinks" value={data.sensory.eyeBlinks} />
                    <StatRow label="Visual Signals" value={data.sensory.visualSignalsProcessed} />
                    <StatRow label="Sounds Processed" value={data.sensory.soundsProcessed} />
                    <StatRow label="Touch Sensations" value={data.sensory.touchSensations} />
                </Section>

                <Section title="Immune System" icon={<Shield className="w-4 h-4" />} isOpen={openSection === 'immune'} onToggle={() => toggle('immune')}>
                    <StatRow label="Pathogens Eliminated" value={data.immuneSystem.pathogensEliminated} />
                    <StatRow label="Antibodies Generated" value={data.immuneSystem.antibodiesGenerated} />
                    <StatRow label="White Cells Produced" value={data.immuneSystem.whiteCellsProduced} />
                </Section>

                <Section title="Life Summary" icon={<Clipboard className="w-4 h-4" />} isOpen={openSection === 'life'} onToggle={() => toggle('life')}>
                    <StatRow label="Life Percentage (Avg)" value={data.lifeComparison.percentageOfLifeLived} unit="%" />
                    <StatRow label="Est. Remaining" value={data.lifeComparison.estimatedRemainingYears} unit="Yrs" />
                    <StatRow label="Biological Status" value={data.lifeComparison.biologicalSystemsOptimal} />
                    <StatRow label="Cellular Age Ratio" value={data.lifeComparison.cellularAgeRatio} />
                </Section>
            </div>
            <div className="p-3 border-t border-white/5 bg-black/20 text-[10px] text-gray-500 text-center">
                {data.medicalDisclaimer}
            </div>
        </div>
    );
};

export default MedicalFactCard;
