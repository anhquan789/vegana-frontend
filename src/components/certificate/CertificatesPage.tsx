'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Badge, Certificate, UserBadge } from '@/types/certificate';
import { useCallback, useEffect, useState } from 'react';

interface CertificatesPageProps {
  userId?: string; // If provided, show certificates for specific user (admin view)
}

export default function CertificatesPage({ userId: propUserId }: CertificatesPageProps) {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [badges, setBadges] = useState<(UserBadge & { badge: Badge })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'certificates' | 'badges'>('certificates');

  const targetUserId = propUserId || user?.uid;

  useEffect(() => {
    if (targetUserId) {
      loadUserData();
    }
  }, [targetUserId]);

  const loadUserData = useCallback(async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      // Mock data for now
      const certsData: Certificate[] = [];
      const badgesData: (UserBadge & { badge: Badge })[] = [];
      
      setCertificates(certsData);
      setBadges(badgesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const handleDownloadCertificate = (certificate: Certificate) => {
    if (certificate.pdfUrl) {
      window.open(certificate.pdfUrl, '_blank');
    } else {
      alert('Certificate PDF is being generated. Please try again in a few moments.');
    }
  };

  const handleVerifyCertificate = async () => {
    const code = prompt('Enter verification code:');
    if (!code) return;

    try {
      // Mock verification for now
      alert('Certificate verification feature will be implemented with backend integration.');
    } catch (error) {
      console.error('Error verifying certificate:', error);
      alert('Error verifying certificate. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading certificates...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {propUserId ? 'User Certificates & Badges' : 'My Certificates & Badges'}
        </h1>
        <button
          onClick={handleVerifyCertificate}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Verify Certificate
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'certificates'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Certificates ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'badges'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Badges ({badges.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'certificates' ? (
        <CertificatesTab 
          certificates={certificates}
          onDownload={handleDownloadCertificate}
        />
      ) : (
        <BadgesTab badges={badges} />
      )}
    </div>
  );
}

// Certificates Tab
interface CertificatesTabProps {
  certificates: Certificate[];
  onDownload: (certificate: Certificate) => void;
}

function CertificatesTab({ certificates, onDownload }: CertificatesTabProps) {
  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="text-gray-400 text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No certificates yet</h3>
        <p className="text-gray-500">Complete courses to earn certificates!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((certificate) => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          onDownload={() => onDownload(certificate)}
        />
      ))}
    </div>
  );
}

// Badges Tab
interface BadgesTabProps {
  badges: (UserBadge & { badge: Badge })[];
}

function BadgesTab({ badges }: BadgesTabProps) {
  const groupedBadges = badges.reduce((groups, userBadge) => {
    const category = userBadge.badge.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(userBadge);
    return groups;
  }, {} as Record<string, (UserBadge & { badge: Badge })[]>);

  if (badges.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="text-gray-400 text-6xl mb-4">🎖️</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No badges yet</h3>
        <p className="text-gray-500">Complete achievements to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
        <div key={category} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
            {category} Badges ({categoryBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoryBadges.map((userBadge) => (
              <BadgeCard key={userBadge.id} userBadge={userBadge} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Certificate Card
interface CertificateCardProps {
  certificate: Certificate;
  onDownload: () => void;
}

function CertificateCard({ certificate, onDownload }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Certificate Preview */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-sm font-medium">Certificate of Completion</div>
        </div>
      </div>

      {/* Certificate Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {certificate.courseName}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Instructor:</span>
            <span className="font-medium">{certificate.instructorName}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Completed:</span>
            <span className="font-medium">{formatDate(certificate.completionDate)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Issued:</span>
            <span className="font-medium">{formatDate(certificate.issuedDate)}</span>
          </div>

          {certificate.score && (
            <div className="flex justify-between">
              <span>Score:</span>
              <span className="font-medium text-green-600">{certificate.score}%</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {certificate.metadata.skills.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">Skills Earned:</div>
            <div className="flex flex-wrap gap-1">
              {certificate.metadata.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
              {certificate.metadata.skills.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{certificate.metadata.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={onDownload}
            disabled={!certificate.pdfUrl}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {certificate.pdfUrl ? 'Download PDF' : 'Generating...'}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(certificate.verificationCode);
              alert('Verification code copied to clipboard!');
            }}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            title="Copy verification code"
          >
            📋
          </button>
        </div>

        {/* Certificate Number */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          #{certificate.certificateNumber}
        </div>
      </div>
    </div>
  );
}

// Badge Card
interface BadgeCardProps {
  userBadge: UserBadge & { badge: Badge };
}

function BadgeCard({ userBadge }: BadgeCardProps) {
  const { badge } = userBadge;
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow text-center">
      {/* Badge Icon */}
      <div className="text-3xl mb-2" style={{ color: badge.color }}>
        {badge.icon}
      </div>

      {/* Badge Name */}
      <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
        {badge.name}
      </h4>

      {/* Badge Description */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
        {badge.description}
      </p>

      {/* Rarity */}
      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getRarityColor(badge.rarity)}`}>
        {badge.rarity}
      </div>

      {/* Points */}
      <div className="text-xs text-gray-500 mb-1">
        {badge.points} points
      </div>

      {/* Earned Date */}
      <div className="text-xs text-gray-400">
        Earned: {formatDate(userBadge.earnedAt)}
      </div>
    </div>
  );
}
