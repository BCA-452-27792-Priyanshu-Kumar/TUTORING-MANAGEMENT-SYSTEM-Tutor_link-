import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BookOpen, Users, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="font-body">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900 text-white">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="container relative mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary-foreground text-sm font-semibold mb-6 border border-primary/30">
              Transform Your Learning Journey
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight leading-tight">
              Master Any Subject with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Expert Tutors</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with top-rated tutors for personalized 1-on-1 sessions. From mathematics to music, find the perfect mentor to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 rounded-xl text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/tutors">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg border-slate-700 bg-white/5 hover:bg-white/10 text-white">
                  Browse Tutors
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Why Choose TutorLink?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We provide the tools and connections you need to excel in your studies.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Verified Experts",
                desc: "Every tutor is vetted to ensure high-quality education and safety for all students."
              },
              {
                icon: Calendar,
                title: "Flexible Scheduling",
                desc: "Book sessions that fit your busy life. Learn early morning or late at night."
              },
              {
                icon: GraduationCap,
                title: "Personalized Learning",
                desc: "Get 1-on-1 attention tailored to your specific learning style and goals."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/25">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ready to start learning?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students achieving their goals with TutorLink today.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 border-none h-14 px-8 text-lg font-semibold rounded-xl">
                  Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Importing Calendar for the features map
import { Calendar } from "lucide-react";
