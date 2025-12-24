import { motion } from 'framer-motion';
import { MapPin, Sparkles, Calendar, BookOpen } from 'lucide-react';
import { FabricStory as FabricStoryType } from '@/types/fabric';

interface FabricStoryProps {
    story: FabricStoryType;
    collectionName: string;
}

const FabricStory = ({ story, collectionName }: FabricStoryProps) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 md:p-8"
        >
            <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                The Story of {collectionName}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Origin */}
                <div className="bg-background/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <MapPin className="w-4 h-4" />
                        <h3 className="font-semibold">Origin</h3>
                    </div>
                    <p className="text-foreground font-medium">{story.origin}</p>
                </div>

                {/* Occasions */}
                <div className="bg-background/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Calendar className="w-4 h-4" />
                        <h3 className="font-semibold">Perfect For</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {story.occasions.map((occasion, index) => (
                            <span
                                key={index}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                                {occasion}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Heritage */}
                <div className="bg-background/50 rounded-xl p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="font-semibold">Heritage & Meaning</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{story.heritage}</p>
                </div>

                {/* Symbolism */}
                <div className="bg-background/50 rounded-xl p-4 md:col-span-2">
                    <h3 className="font-semibold text-primary mb-2">Symbolism</h3>
                    <p className="text-muted-foreground leading-relaxed">{story.symbolism}</p>
                </div>
            </div>
        </motion.section>
    );
};

export default FabricStory;
