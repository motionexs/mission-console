"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink } from "lucide-react";

export default function ArticlesPage() {
  const articles = [
    { title: "Validation of a Wireless Device-Driven Method of Estimating Caloric Expenditure during Running", authors: "Cronen A et al.", journal: "Appl Physiol Nutr Metab", year: 2026, doi: "10.1139/apnm-2025-0395" },
    { title: "Basal Energetics and Phosphocreatine Recovery Kinetics in Ambulatory Boys With Duchenne Muscular Dystrophy", authors: "Awale PP et al.", journal: "NMR Biomed", year: 2026, doi: "10.1002/nbm.70336" },
    { title: "Wearable IMU-based Framework for Daily Physical Activity Recognition and Energy Expenditure Level Classification", authors: "Zhou X et al.", journal: "Front Public Health", year: 2026, doi: "10.3389/fpubh.2026.1829967" },
    { title: "Resting Metabolic Rate and Adaptive Thermogenesis in Physique Athletes", authors: "Tinsley GM et al.", journal: "J Int Soc Sports Nutr", year: 2026, doi: "10.1080/15502783.2026.2676190" },
  { title: "Accuracy, Repeatability, and Interchangeability of Smartphone-Based Digital Anthropometry for Body Fat Estimation", authors: "Encarnacao IGAD et al.", journal: "Clin Nutr ESPEN", year: 2026, doi: "10.1016/j.clnesp.2026.103391" },
  { title: "Health-related quality of life in young pediatric cancer survivors: The role of sarcopenia", authors: "Marmol-Perez A et al.", journal: "Support Care Cancer", year: 2026, doi: "10.1007/s00520-026-10888-4" },
  { title: "Effect of high-intensity interval training on mitochondrial function in master athletes", authors: "Hoffmann S et al.", journal: "Eur J Appl Physiol", year: 2026, pmid: "42275353" },
    { title: "Comparison of different periodization models on strength and power outcomes", authors: "Carvalho A et al.", journal: "J Strength Cond Res", year: 2026, pmid: "42206588" },
    { title: "Nutritional periodization for endurance athletes", authors: "Jeukendrup AE et al.", journal: "Int J Sport Nutr Exerc Metab", year: 2026, pmid: "42204723" },
    { title: "Meta-analysis: Concurrent training effects on aerobic and anaerobic performance", authors: "Wilson JM et al.", journal: "Sports Med", year: 2026, pmid: "42188019" },
  ];

  return (
    <div>
      <h1 className="page-title">Articles</h1>
      <p className="page-subtitle">{articles.length} research papers</p>
      <div className="card">
        <div className="card-body">
          <div className="item-list">
            {articles.map((a) => (
              <li key={a.doi}>
                <div>
                  <div className="item-title">{a.title}</div>
                  <div className="item-meta" style={{ marginTop: 4 }}>
                    {a.authors} · {a.journal} ({a.year})
                  </div>
                </div>
                {a.doi && (
                  <a href={"https://doi.org/" + a.doi} target="_blank" rel="noopener noreferrer"
                     style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink className="w-3 h-3" /> DOI
                  </a>
                )}
                {a.pmid && (
                  <a href={"https://pubmed.ncbi.nlm.nih.gov/" + a.pmid} target="_blank" rel="noopener noreferrer"
                     style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink className="w-3 h-3" /> PubMed
                  </a>
                )}
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
